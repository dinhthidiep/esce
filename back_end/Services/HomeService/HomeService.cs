using ESCE_SYSTEM.DTOs.Home;
using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;

namespace ESCE_SYSTEM.Services.HomeService
{
    public class HomeService : IHomeService
    {
        private readonly ESCEContext _context;

        public HomeService(ESCEContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TestimonialDto>> GetTestimonialsAsync(int limit = 3)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Author)
                .Include(r => r.Combo)
                .Where(r => r.Rating != null && r.Rating >= 4 && r.ParentReviewId == null)
                .OrderByDescending(r => r.CreatedAt)
                .Take(limit)
                .ToListAsync();

            var testimonials = reviews.Select(r => new TestimonialDto
            {
                Rating = r.Rating ?? 0,
                Content = r.Content,
                AuthorName = r.Author.Name ?? "Anonymous",
                AuthorAvatar = r.Author.Avatar,
                ServiceName = r.Combo.Name,
                TimeAgo = CalculateTimeAgo(r.CreatedAt ?? DateTime.UtcNow)
            });

            return testimonials;
        }

        public async Task<IEnumerable<MostLikedComboDto>> GetMostLikedCombosAsync(int limit = 3)
        {
            var combos = await _context.Servicecombos
                .Include(c => c.Reviews)
                .Include(c => c.Bookings)
                .Include(c => c.Coupons)
                .Where(c => c.Status == "open")
                .Select(c => new
                {
                    Combo = c,
                    AverageRating = c.Reviews.Any(r => r.Rating != null) 
                        ? c.Reviews.Where(r => r.Rating != null).Average(r => r.Rating.Value) 
                        : 0,
                    TotalReviews = c.Reviews.Count(r => r.ParentReviewId == null),
                    TotalBookings = c.Bookings.Count,
                    ActiveCoupon = c.Coupons
                        .Where(cp => cp.IsActive == true && cp.DiscountPercent != null)
                        .OrderByDescending(cp => cp.DiscountPercent)
                        .FirstOrDefault()
                })
                .OrderByDescending(x => x.TotalBookings)
                .ThenByDescending(x => x.AverageRating)
                .Take(limit)
                .ToListAsync();

            return combos.Select(x => new MostLikedComboDto
            {
                Id = x.Combo.Id,
                Name = x.Combo.Name,
                Address = x.Combo.Address,
                Price = x.Combo.Price,
                Image = x.Combo.Image,
                AverageRating = Math.Round(x.AverageRating, 1),
                TotalReviews = x.TotalReviews,
                TotalBookings = x.TotalBookings,
                DiscountLabel = x.ActiveCoupon != null 
                    ? $"Giam {x.ActiveCoupon.DiscountPercent}%" 
                    : null
            });
        }

        private static string CalculateTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.UtcNow - dateTime;

            if (timeSpan.TotalDays >= 365)
            {
                int years = (int)(timeSpan.TotalDays / 365);
                return $"{years} nam truoc";
            }
            else if (timeSpan.TotalDays >= 30)
            {
                int months = (int)(timeSpan.TotalDays / 30);
                return $"{months} thang truoc";
            }
            else if (timeSpan.TotalDays >= 7)
            {
                int weeks = (int)(timeSpan.TotalDays / 7);
                return $"{weeks} tuan truoc";
            }
            else if (timeSpan.TotalDays >= 1)
            {
                return $"{(int)timeSpan.TotalDays} ngay truoc";
            }
            else if (timeSpan.TotalHours >= 1)
            {
                return $"{(int)timeSpan.TotalHours} gio truoc";
            }
            else if (timeSpan.TotalMinutes >= 1)
            {
                return $"{(int)timeSpan.TotalMinutes} phut truoc";
            }
            else
            {
                return "Vua xong";
            }
        }
    }
}

