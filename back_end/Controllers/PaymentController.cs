/*
using ESCE_SYSTEM.Models;
using Microsoft.AspNetCore.Mvc;
using Net.payOS;
using Net.payOS.Types;

namespace ESCE_SYSTEM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ESCEContext _context;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IConfiguration configuration, ESCEContext context, ILogger<PaymentController> logger)
        {
            _configuration = configuration;
            _context = context;
            _logger = logger;
        }

        [HttpPost("create-payment-link")]
        public async Task<IActionResult> CreatePaymentLink([FromBody] PaymentRequest request)
        {
            try
            {
                // Lấy thông tin PayOS từ configuration
                var clientId = _configuration["PayOS:ClientId"];
                var apiKey = _configuration["PayOS:ApiKey"];
                var checksumKey = _configuration["PayOS:ChecksumKey"];

                if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(checksumKey))
                {
                    return BadRequest("PayOS configuration is missing");
                }

                var payOS = new PayOS(clientId, apiKey, checksumKey);

                // Tạo orderCode duy nhất
                var orderCode = int.Parse(DateTimeOffset.Now.ToString("ffffff"));

                // Tạo payment data
                var paymentLinkRequest = new PaymentData(
                    orderCode: orderCode,
                    amount: request.Amount,
                    description: request.Description,
                    items: request.Items.Select(item => new ItemData(item.Name, item.Quantity, item.Price)).ToArray(),
                    returnUrl: request.ReturnUrl,
                    cancelUrl: request.CancelUrl
                );

                var response = await payOS.createPaymentLink(paymentLinkRequest);

                // Lưu thông tin payment vào database (tùy chọn)
                var payment = new Payment
                {
                    OrderCode = orderCode,
                    Amount = request.Amount,
                    Description = request.Description,
                    Status = "PENDING",
                    CreatedAt = DateTime.Now,
                    CheckoutUrl = response.checkoutUrl
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                return Ok(new { checkoutUrl = response.checkoutUrl, orderCode = orderCode });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment link");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("confirm-payment")]
        public async Task<IActionResult> ConfirmPayment([FromBody] PaymentConfirmationRequest request)
        {
            try
            {
                var clientId = _configuration["PayOS:ClientId"];
                var apiKey = _configuration["PayOS:ApiKey"];
                var checksumKey = _configuration["PayOS:ChecksumKey"];

                var payOS = new PayOS(clientId, apiKey, checksumKey);

                // Xác thực payment
                var paymentInfo = await payOS.verifyPaymentWebhookData(request.Code, request.Amount, request.Description);

                // Cập nhật trạng thái payment trong database
                var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderCode == request.Code);
                if (payment != null)
                {
                    payment.Status = "COMPLETED";
                    payment.CompletedAt = DateTime.Now;
                    await _context.SaveChangesAsync();
                }

                return Ok(new { success = true, message = "Payment confirmed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming payment");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("payment-status/{orderCode}")]
        public async Task<IActionResult> GetPaymentStatus(int orderCode)
        {
            try
            {
                var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderCode == orderCode);
                if (payment == null)
                {
                    return NotFound("Payment not found");
                }

                return Ok(new { 
                    orderCode = payment.OrderCode,
                    status = payment.Status,
                    amount = payment.Amount,
                    createdAt = payment.CreatedAt,
                    completedAt = payment.CompletedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment status");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    // DTO classes
    public class PaymentRequest
    {
        public int Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<PaymentItem> Items { get; set; } = new List<PaymentItem>();
        public string ReturnUrl { get; set; } = string.Empty;
        public string CancelUrl { get; set; } = string.Empty;
    }

    public class PaymentItem
    {
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public int Price { get; set; }
    }

    public class PaymentConfirmationRequest
    {
        public int Code { get; set; }
        public int Amount { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}

*/
