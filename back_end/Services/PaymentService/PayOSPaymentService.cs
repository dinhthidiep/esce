using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Options;
using Microsoft.EntityFrameworkCore;
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
            try
            {
                // Minimal payload based on typical PayOS create-payment format
                var orderCode = $"ESCE-{booking.Id}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

                // PayOS expects amount as integer in VND (smallest currency unit)
                // Assuming amount is already in VND (e.g., 100000 VND), convert to long
                var amountInVnd = (long)amount;

                var payload = new
                {
                    amount = amountInVnd,
                    description = description,
                    orderCode = orderCode,
                    returnUrl = _options.ReturnUrl,
                    cancelUrl = _options.CancelUrl,
                    // WebhookUrl is optional - can be set in PayOS dashboard or here
                    webhookUrl = !string.IsNullOrEmpty(_options.WebhookUrl) ? _options.WebhookUrl : null
                };

                using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.payos.vn/v2/payment-requests");
                req.Headers.Add("x-client-id", _options.ClientId);
                req.Headers.Add("x-api-key", _options.ApiKey);
                req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

                using var res = await _httpClient.SendAsync(req);
                
                if (!res.IsSuccessStatusCode)
                {
                    var errorContent = await res.Content.ReadAsStringAsync();
                    throw new Exception($"PayOS API error: {res.StatusCode} - {errorContent}");
                }

                var json = await res.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                
                if (!root.TryGetProperty("data", out var data))
                {
                    throw new Exception("Invalid response from PayOS API: missing data property");
                }

                if (!data.TryGetProperty("checkoutUrl", out var checkoutUrlElement))
                {
                    throw new Exception("Invalid response from PayOS API: missing checkoutUrl");
                }

                var checkoutUrl = checkoutUrlElement.GetString() ?? string.Empty;

                // Save Payment record
                var payment = new Payment
                {
                    BookingId = booking.Id,
                    Amount = amount,
                    Method = "PAYOS",
                    Status = "pending"
                };
                _db.Payments.Add(payment);
                await _db.SaveChangesAsync();

                return new CreatePaymentResponse
                {
                    CheckoutUrl = checkoutUrl,
                    OrderCode = orderCode
                };
            }
            catch (Exception ex)
            {
                // Log error (you might want to use ILogger here)
                throw new Exception($"Failed to create payment: {ex.Message}", ex);
            }
        }

        public async Task<bool> HandleWebhookAsync(HttpRequest request)
        {
            try
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
                
                if (!data.TryGetProperty("orderCode", out var orderCodeElement)) return false;
                var orderCode = orderCodeElement.GetString();
                
                if (string.IsNullOrEmpty(orderCode)) return false;

                // Parse orderCode to get BookingId: format "ESCE-{bookingId}-{timestamp}"
                var parts = orderCode.Split('-');
                if (parts.Length < 2 || !int.TryParse(parts[1], out var bookingId))
                {
                    return false;
                }

                // Find payment by BookingId and Status = "pending" (most recent)
                var payment = await _db.Payments
                    .Where(p => p.BookingId == bookingId && p.Status == "pending")
                    .OrderByDescending(p => p.Id)
                    .FirstOrDefaultAsync();

                if (payment == null) return false;

                if (!data.TryGetProperty("status", out var statusElement)) return false;
                var status = statusElement.GetString();

                payment.Status = MapStatus(status);
                
                // Update PaymentDate when payment is successful
                if (payment.Status == "success")
                {
                    payment.PaymentDate = DateTime.UtcNow;
                }

                await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                // Log error (you might want to use ILogger here)
                return false;
            }
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


