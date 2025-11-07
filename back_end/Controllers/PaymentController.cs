using ESCE_SYSTEM.DTOs.Payment;
using ESCE_SYSTEM.Enums;
using ESCE_SYSTEM.Services.PaymentService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ESCE_SYSTEM.Controllers
{
    [Route("api/payment")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto createPaymentDto)
        {
            try
            {
                var payment = await _paymentService.CreatePaymentAsync(createPaymentDto);
                return Ok(payment);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating payment", error = ex.Message });
            }
        }

        [HttpGet("callback")]
        public async Task<IActionResult> PaymentCallback([FromQuery] int orderCode, [FromQuery] string status)
        {
            try
            {
                var payment = await _paymentService.HandlePaymentCallbackAsync(orderCode, status);

                if (payment.Status == PaymentStatus.Completed)
                {
                    return Redirect($"/payment/success?bookingId={payment.BookingId}");
                }
                else
                {
                    return Redirect($"/payment/failed?bookingId={payment.BookingId}");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Payment callback failed", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetPaymentById(int id)
        {
            try
            {
                var payment = await _paymentService.GetPaymentByIdAsync(id);
                return Ok(payment);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("booking/{bookingId}")]
        [Authorize]
        public async Task<IActionResult> GetPaymentsByBookingId(int bookingId)
        {
            try
            {
                var payments = await _paymentService.GetPaymentsByBookingIdAsync(bookingId);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPut("update-status")]
        [Authorize]
        public async Task<IActionResult> UpdatePaymentStatus([FromBody] UpdatePaymentStatusDto updateDto)
        {
            try
            {
                var payment = await _paymentService.UpdatePaymentStatusAsync(updateDto);
                return Ok(payment);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating payment status", error = ex.Message });
            }
        }
    }
}
