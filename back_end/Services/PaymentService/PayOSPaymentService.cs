using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Options;
using Microsoft.Extensions.Options;

namespace ESCE_SYSTEM.Services.PaymentService
{
    public class PayOSPaymentService : IPaymentService
    {
        private readonly HttpClient _httpClient;
        private readonly PayOSOptions _options;
        private readonly ESCEContext _db;

        public PayOSPaymentService(HttpClient httpClient, IOptions<PayOSOptions> options, ESCEContext db)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _db = db;
        }

        public async Task<CreatePaymentResponse> CreatePaymentAsync(Booking booking, decimal amount, string description)
        {
            // Minimal payload based on typical PayOS create-payment format
            var orderCode = $"ESCE-{booking.Id}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

            var payload = new
            {
                amount = (long)(amount),
                description = description,
                orderCode = orderCode,
                returnUrl = _options.ReturnUrl,
                cancelUrl = _options.CancelUrl
            };

            using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.payos.vn/v2/payment-requests");
            req.Headers.Add("x-client-id", _options.ClientId);
            req.Headers.Add("x-api-key", _options.ApiKey);
            req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            using var res = await _httpClient.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            var data = root.GetProperty("data");
            var checkoutUrl = data.GetProperty("checkoutUrl").GetString() ?? string.Empty;

            // Save Payment record
            var payment = new Payment
            {
                BookingId = booking.Id,
                Amount = amount,
                PaymentMethod = "PAYOS",
                Status = "pending",
                TransactionId = orderCode,
                CreatedAt = DateTime.UtcNow
            };
            _db.Payments.Add(payment);
            await _db.SaveChangesAsync();

            return new CreatePaymentResponse
            {
                CheckoutUrl = checkoutUrl,
                OrderCode = orderCode
            };
        }

        public async Task<bool> HandleWebhookAsync(HttpRequest request)
        {
            // Read body
            request.EnableBuffering();
            using var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            request.Body.Position = 0;

            // Validate signature if provided
            if (request.Headers.TryGetValue("x-payos-signature", out var signatureHeader))
            {
                var signature = signatureHeader.ToString();
                if (!VerifySignature(body, signature, _options.ChecksumKey))
                {
                    return false;
                }
            }

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;
            // Expect something like { data: { orderCode, amount, status } }
            if (!root.TryGetProperty("data", out var data)) return false;
            var orderCode = data.GetProperty("orderCode").GetString();
            var status = data.GetProperty("status").GetString();

            if (string.IsNullOrEmpty(orderCode)) return false;

            var payment = _db.Payments.FirstOrDefault(p => p.TransactionId == orderCode);
            if (payment == null) return false;

            payment.Status = MapStatus(status);
            payment.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }

        private static string MapStatus(string? payosStatus)
        {
            return payosStatus switch
            {
                "PAID" => "success",
                "CANCELED" => "canceled",
                _ => "pending"
            };
        }

        private static bool VerifySignature(string body, string signature, string checksumKey)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(checksumKey));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(body));
            var computed = BitConverter.ToString(hash).Replace("-", string.Empty).ToLowerInvariant();
            return string.Equals(computed, signature, StringComparison.OrdinalIgnoreCase);
        }
    }
}



