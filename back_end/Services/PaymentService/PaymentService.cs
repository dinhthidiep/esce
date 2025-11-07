using ESCE_SYSTEM.DTOs.Payment;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Enums;
using ESCE_SYSTEM.Services.UserContextService;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace ESCE_SYSTEM.Services.PaymentService
{
    public class PaymentService : IPaymentService
    {
        private readonly ESCEContext _context;
        private readonly IUserContextService _userContextService;
        private readonly HttpClient _httpClient;
        private readonly string _clientId;
        private readonly string _apiKey;
        private readonly string _checksumKey;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(
            ESCEContext context,
            IUserContextService userContextService,
            IConfiguration configuration,
            ILogger<PaymentService> logger)
        {
            _context = context;
            _userContextService = userContextService;
            _logger = logger;

            _httpClient = new HttpClient
            {
                BaseAddress = new Uri("https://api-merchant.payos.vn")
            };

            _clientId = configuration["PayOS:ClientId"] ?? throw new Exception("PayOS ClientId not found");
            _apiKey = configuration["PayOS:ApiKey"] ?? throw new Exception("PayOS ApiKey not found");
            _checksumKey = configuration["PayOS:ChecksumKey"] ?? throw new Exception("PayOS ChecksumKey not found");

            _httpClient.DefaultRequestHeaders.Add("x-client-id", _clientId);
            _httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);
        }

        public async Task<PaymentResponseDto> CreatePaymentAsync(CreatePaymentDto createPaymentDto)
        {
            var userId = _userContextService.UserId;
            if (userId == null)
                throw new UnauthorizedAccessException("User not authenticated");

            var booking = await _context.Bookings
                .Include(b => b.Combo)
                .FirstOrDefaultAsync(b => b.Id == createPaymentDto.BookingId && b.UserId == int.Parse(userId));

            if (booking == null)
                throw new InvalidOperationException("Booking not found or you don't have permission");

            if (booking.Status != "pending")
                throw new InvalidOperationException("Booking is not in pending status");

            var existingPayment = await _context.Payments
                .FirstOrDefaultAsync(p => p.BookingId == booking.Id);

            if (existingPayment != null && existingPayment.Status == PaymentStatus.Completed.ToString())
            {
                throw new InvalidOperationException("This booking already has a completed payment");
            }

            Models.Payment payment;
            if (existingPayment != null)
            {
                payment = existingPayment;
            }
            else
            {
                payment = new Models.Payment
                {
                    BookingId = booking.Id,
                    Amount = booking.TotalAmount,
                    PaymentDate = null,
                    Method = "PayOS",
                    Status = PaymentStatus.Pending.ToString()
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();
            }

            try
            {
                // Create PayOS payment link using HttpClient
                long orderCode = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                int amount = (int)booking.TotalAmount;
                string description = $"Thanh toan booking #{booking.Id}";
                string returnUrl = createPaymentDto.ReturnUrl ?? "https://localhost:7267/payment/success";
                string cancelUrl = createPaymentDto.CancelUrl ?? "https://localhost:7267/payment/cancel";
                string productName = booking.Combo?.Name ?? "Tour Package";

                // Tính signature theo thứ tự alphabet
                string signatureData = $"amount={amount}&cancelUrl={cancelUrl}&description={description}&orderCode={orderCode}&returnUrl={returnUrl}";
                string signature = ComputeHmacSha256(signatureData, _checksumKey);

                var payload = new
                {
                    orderCode = orderCode,
                    amount = amount,
                    description = description,
                    returnUrl = returnUrl,
                    cancelUrl = cancelUrl,
                    signature = signature,
                    items = new[]
                    {
                        new
                        {
                            name = productName,
                            quantity = 1,
                            price = amount
                        }
                    }
                };

                _logger.LogInformation("Creating payment with orderCode: {OrderCode}", orderCode);
                _logger.LogInformation("Signature data: {SignatureData}", signatureData);
                _logger.LogInformation("Signature: {Signature}", signature);

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("/v2/payment-requests", content);
                var responseBody = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("Response status: {Status}", response.StatusCode);
                _logger.LogInformation("Response body: {Body}", responseBody);

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"PayOS API error: {responseBody}");
                }

                var result = JsonSerializer.Deserialize<PayOsApiResponse>(responseBody, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (result?.Code != "00")
                {
                    throw new Exception($"PayOS error: {result?.Desc}");
                }

                if (result.Data == null)
                {
                    throw new Exception("No data in PayOS response");
                }

                payment.Status = PaymentStatus.Pending.ToString();
                await _context.SaveChangesAsync();

                return new PaymentResponseDto
                {
                    Id = payment.Id,
                    BookingId = payment.BookingId,
                    Amount = payment.Amount,
                    PaymentDate = payment.PaymentDate,
                    Method = payment.Method,
                    Status = Enum.Parse<PaymentStatus>(payment.Status),
                    CheckoutUrl = result.Data.CheckoutUrl
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment link");
                throw new Exception($"An error occurred while creating payment: {ex.Message}");
            }
        }

        private string ComputeHmacSha256(string data, string key)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }

        public async Task<PaymentResponseDto> HandlePaymentCallbackAsync(int orderCode, string status)
        {
            var payment = await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.Status == PaymentStatus.Pending.ToString());

            if (payment == null)
                throw new InvalidOperationException("Payment not found");

            if (status == "PAID")
            {
                payment.Status = PaymentStatus.Completed.ToString();
                payment.PaymentDate = DateTime.UtcNow;
                payment.Booking.Status = "confirmed";
            }
            else if (status == "CANCELLED")
            {
                payment.Status = PaymentStatus.Failed.ToString();
                payment.Booking.Status = "cancelled";

                var combo = await _context.Servicecombos.FindAsync(payment.Booking.ComboId);
                if (combo != null)
                {
                    combo.AvailableSlots += payment.Booking.Quantity;
                }
            }

            await _context.SaveChangesAsync();

            return new PaymentResponseDto
            {
                Id = payment.Id,
                BookingId = payment.BookingId,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                Method = payment.Method,
                Status = Enum.Parse<PaymentStatus>(payment.Status)
            };
        }

        public async Task<PaymentResponseDto> GetPaymentByIdAsync(int id)
        {
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null)
                throw new InvalidOperationException("Payment not found");

            return new PaymentResponseDto
            {
                Id = payment.Id,
                BookingId = payment.BookingId,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                Method = payment.Method,
                Status = Enum.Parse<PaymentStatus>(payment.Status ?? PaymentStatus.Pending.ToString())
            };
        }

        public async Task<IEnumerable<PaymentResponseDto>> GetPaymentsByBookingIdAsync(int bookingId)
        {
            var payments = await _context.Payments
                .Where(p => p.BookingId == bookingId)
                .ToListAsync();

            return payments.Select(p => new PaymentResponseDto
            {
                Id = p.Id,
                BookingId = p.BookingId,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                Method = p.Method,
                Status = Enum.Parse<PaymentStatus>(p.Status ?? PaymentStatus.Pending.ToString())
            });
        }

        public async Task<PaymentResponseDto> UpdatePaymentStatusAsync(UpdatePaymentStatusDto updateDto)
        {
            var userId = _userContextService.UserId;
            if (userId == null)
                throw new UnauthorizedAccessException("User not authenticated");

            var payment = await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.Id == updateDto.PaymentId);

            if (payment == null)
                throw new InvalidOperationException("Payment not found");

            if (payment.Booking.UserId != int.Parse(userId))
                throw new UnauthorizedAccessException("You don't have permission to update this payment");

            payment.Status = updateDto.Status.ToString();

            if (updateDto.Status == PaymentStatus.Completed)
            {
                payment.PaymentDate = DateTime.UtcNow;
                payment.Booking.Status = "confirmed";
            }
            else if (updateDto.Status == PaymentStatus.Failed || updateDto.Status == PaymentStatus.Cancelled)
            {
                payment.Booking.Status = "cancelled";

                var combo = await _context.Servicecombos.FindAsync(payment.Booking.ComboId);
                if (combo != null)
                {
                    combo.AvailableSlots += payment.Booking.Quantity;
                }
            }

            await _context.SaveChangesAsync();

            return new PaymentResponseDto
            {
                Id = payment.Id,
                BookingId = payment.BookingId,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                Method = payment.Method,
                Status = updateDto.Status
            };
        }
    }

    // PayOS API Response Models
    public class PayOsApiResponse
    {
        public string Code { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
        public PayOsCreateResponse? Data { get; set; }
        public string Signature { get; set; } = string.Empty;
    }

    public class PayOsCreateResponse
    {
        public string Bin { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public int Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public long OrderCode { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string PaymentLinkId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CheckoutUrl { get; set; } = string.Empty;
        public string QrCode { get; set; } = string.Empty;
    }
}
