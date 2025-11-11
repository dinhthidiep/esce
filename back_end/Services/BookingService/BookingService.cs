using ESCE_SYSTEM.DTOs.Booking;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Repositories.BookingRepository;
using ESCE_SYSTEM.Services.UserContextService;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace ESCE_SYSTEM.Services.BookingService
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IUserContextService _userContextService;
        private readonly ESCEContext _context;

        public BookingService(
            IBookingRepository bookingRepository,
            IUserContextService userContextService,
            ESCEContext context)
        {
            _bookingRepository = bookingRepository;
            _userContextService = userContextService;
            _context = context;
        }

        public async Task<BookingResponseDto> CreateBookingAsync(CreateBookingDto createBookingDto)
        {
            if (!int.TryParse(_userContextService.UserId, out int userId))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }

            var combo = await _context.Servicecombos.FindAsync(createBookingDto.ComboId);
            if (combo == null)
            {
                throw new InvalidOperationException("Tour combo not found");
            }

            if (combo.Status != "open")
            {
                throw new InvalidOperationException("Tour combo is not available for booking");
            }

            if (combo.AvailableSlots < createBookingDto.Quantity)
            {
                throw new InvalidOperationException($"Not enough slots available. Only {combo.AvailableSlots} slots remaining");
            }

            decimal totalAmount = combo.Price * createBookingDto.Quantity;
            decimal discountAmount = 0;

            var booking = new Booking
            {
                UserId = userId,
                ComboId = createBookingDto.ComboId,
                BookingDate = DateTime.UtcNow,
                StartDate = createBookingDto.StartDate,
                EndDate = createBookingDto.EndDate,
                Quantity = createBookingDto.Quantity,
                TotalAmount = totalAmount,
                Notes = createBookingDto.Notes,
                Status = "pending"
            };

            await _bookingRepository.AddAsync(booking);

            if (createBookingDto.CouponCodes != null && createBookingDto.CouponCodes.Any())
            {
                foreach (var couponCode in createBookingDto.CouponCodes)
                {
                    var coupon = await _context.Coupons
                        .FirstOrDefaultAsync(c => c.Code == couponCode && 
                                                  c.ServicecomboId == createBookingDto.ComboId &&
                                                  c.IsActive == true);

                    if (coupon != null && coupon.UsageCount < coupon.UsageLimit)
                    {
                        var bookingCoupon = new BookingCoupon
                        {
                            BookingId = booking.Id,
                            CouponId = coupon.Id
                        };
                        _context.BookingCoupons.Add(bookingCoupon);

                        if (coupon.DiscountPercent.HasValue)
                        {
                            discountAmount += totalAmount * (coupon.DiscountPercent.Value / 100);
                        }
                        else if (coupon.DiscountAmount.HasValue)
                        {
                            discountAmount += coupon.DiscountAmount.Value;
                        }

                        coupon.UsageCount++;
                        _context.Coupons.Update(coupon);
                    }
                }

                booking.TotalAmount = totalAmount - discountAmount;
                await _context.SaveChangesAsync();
            }

            combo.AvailableSlots -= createBookingDto.Quantity;
            _context.Servicecombos.Update(combo);
            await _context.SaveChangesAsync();

            return new BookingResponseDto
            {
                Id = booking.Id,
                UserId = booking.UserId,
                ComboId = booking.ComboId,
                ComboName = combo.Name,
                BookingDate = booking.BookingDate,
                StartDate = booking.StartDate,
                EndDate = booking.EndDate,
                Quantity = booking.Quantity,
                TotalAmount = booking.TotalAmount,
                Notes = booking.Notes,
                Status = booking.Status
            };
        }

        public async Task<List<BookingResponseDto>> GetUserBookingsAsync()
        {
            if (!int.TryParse(_userContextService.UserId, out int userId))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }

            var bookings = await _bookingRepository.GetByUserIdAsync(userId);

            return bookings.Select(b => new BookingResponseDto
            {
                Id = b.Id,
                UserId = b.UserId,
                ComboId = b.ComboId,
                ComboName = b.Combo?.Name ?? "",
                BookingDate = b.BookingDate,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                Quantity = b.Quantity,
                TotalAmount = b.TotalAmount,
                Notes = b.Notes,
                Status = b.Status
            }).ToList();
        }

        public async Task<BookingResponseDto> GetBookingByIdAsync(int id)
        {
            if (!int.TryParse(_userContextService.UserId, out int userId))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }

            var booking = await _bookingRepository.GetByIdAsync(id);

            if (booking == null)
            {
                throw new InvalidOperationException("Booking not found");
            }

            if (booking.UserId != userId)
            {
                throw new UnauthorizedAccessException("You don't have permission to view this booking");
            }

            return new BookingResponseDto
            {
                Id = booking.Id,
                UserId = booking.UserId,
                ComboId = booking.ComboId,
                ComboName = booking.Combo?.Name ?? "",
                BookingDate = booking.BookingDate,
                StartDate = booking.StartDate,
                EndDate = booking.EndDate,
                Quantity = booking.Quantity,
                TotalAmount = booking.TotalAmount,
                Notes = booking.Notes,
                Status = booking.Status
            };
        }

        public async Task CancelBookingAsync(int id)
        {
            if (!int.TryParse(_userContextService.UserId, out int userId))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }

            var booking = await _bookingRepository.GetByIdAsync(id);

            if (booking == null)
            {
                throw new InvalidOperationException("Booking not found");
            }

            if (booking.UserId != userId)
            {
                throw new UnauthorizedAccessException("You don't have permission to cancel this booking");
            }

            if (booking.Status == "canceled")
            {
                throw new InvalidOperationException("Booking is already canceled");
            }

            if (booking.Status == "completed")
            {
                throw new InvalidOperationException("Cannot cancel completed booking");
            }

            booking.Status = "canceled";
            await _bookingRepository.UpdateAsync(booking);

            var combo = await _context.Servicecombos.FindAsync(booking.ComboId);
            if (combo != null)
            {
                combo.AvailableSlots += booking.Quantity;
                _context.Servicecombos.Update(combo);
                await _context.SaveChangesAsync();
            }
        }
    }
}

