using ESCE_SYSTEM.DTOs.Tours;
using ESCE_SYSTEM.Models;
using Microsoft.EntityFrameworkCore;

namespace ESCE_SYSTEM.Repositories.TourRepository
{
    public class TourRepository : ITourRepository
    {
        private readonly ESCEContext _context;

        public TourRepository(ESCEContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Tour>> GetAllToursAsync()
        {
            return await _context.Tours
                .Include(t => t.Host)
                .Include(t => t.Reviews)
                .OrderByDescending(t => t.Reviews.Any() ? t.Reviews.Average(r => r.Rating) : 0)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<Tour?> GetTourByIdAsync(int id)
        {
            return await _context.Tours
                .Include(t => t.Host)
                .Include(t => t.Reviews)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Tour> CreateTourAsync(Tour tour)
        {
            tour.CreatedAt = DateTime.Now;
            tour.UpdatedAt = DateTime.Now;
            tour.AvailableSlots = tour.Capacity; // Ban đầu available slots = capacity

            _context.Tours.Add(tour);
            await _context.SaveChangesAsync();
            return tour;
        }

        public async Task<Tour?> UpdateTourAsync(Tour tour)
        {
            var existingTour = await _context.Tours.FindAsync(tour.Id);
            if (existingTour == null)
                return null;

            // Cập nhật thông tin tour
            existingTour.Name = tour.Name;
            existingTour.Address = tour.Address;
            existingTour.Description = tour.Description;
            existingTour.Price = tour.Price;
            existingTour.StartDate = tour.StartDate;
            existingTour.EndDate = tour.EndDate;
            existingTour.Capacity = tour.Capacity;
            existingTour.Image = tour.Image;
            existingTour.Status = tour.Status;
            existingTour.HostId = tour.HostId;
            existingTour.UpdatedAt = DateTime.Now;

            // Cập nhật available slots nếu capacity thay đổi
            if (existingTour.Capacity != tour.Capacity)
            {
                var bookedSlots = existingTour.Capacity - existingTour.AvailableSlots;
                existingTour.AvailableSlots = Math.Max(0, tour.Capacity - bookedSlots);
            }

            await _context.SaveChangesAsync();
            return existingTour;
        }

        public async Task<bool> DeleteTourAsync(int id)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour == null)
                return false;

            _context.Tours.Remove(tour);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Tour>> SearchToursAsync(TourSearchDto searchDto)
        {
            var query = _context.Tours
                .Include(t => t.Host)
                .Include(t => t.Reviews) // Include reviews để tính đánh giá
                .AsQueryable();

            // Tìm kiếm theo search key (tên hoặc địa chỉ)
            if (!string.IsNullOrEmpty(searchDto.SearchKey))
            {
                query = query.Where(t => t.Name.Contains(searchDto.SearchKey) || t.Address.Contains(searchDto.SearchKey));
            }

            // Tìm kiếm theo địa chỉ cụ thể
            if (!string.IsNullOrEmpty(searchDto.Address))
            {
                query = query.Where(t => t.Address.Contains(searchDto.Address));
            }

            // Tìm kiếm theo giá
            if (searchDto.MinPrice.HasValue)
            {
                query = query.Where(t => t.Price >= searchDto.MinPrice.Value);
            }

            if (searchDto.MaxPrice.HasValue)
            {
                query = query.Where(t => t.Price <= searchDto.MaxPrice.Value);
            }

            // Tìm kiếm theo ngày bắt đầu
            if (searchDto.StartDateFrom.HasValue)
            {
                query = query.Where(t => t.StartDate >= searchDto.StartDateFrom.Value);
            }

            if (searchDto.StartDateTo.HasValue)
            {
                query = query.Where(t => t.StartDate <= searchDto.StartDateTo.Value);
            }

            // Tìm kiếm theo ngày kết thúc
            if (searchDto.EndDateFrom.HasValue)
            {
                query = query.Where(t => t.EndDate >= searchDto.EndDateFrom.Value);
            }

            if (searchDto.EndDateTo.HasValue)
            {
                query = query.Where(t => t.EndDate <= searchDto.EndDateTo.Value);
            }

            // Tìm kiếm theo trạng thái
            if (!string.IsNullOrEmpty(searchDto.Status))
            {
                query = query.Where(t => t.Status == searchDto.Status);
            }

            // Tìm kiếm theo host
            if (searchDto.HostId.HasValue)
            {
                query = query.Where(t => t.HostId == searchDto.HostId.Value);
            }

            // Sắp xếp
            switch (searchDto.SortBy?.ToLower())
            {
                case "rating":
                    // Sort theo đánh giá: tour có đánh giá cao nhất lên đầu, tour chưa có đánh giá sort theo thời gian tạo
                    query = searchDto.SortOrder?.ToLower() == "asc" 
                        ? query.OrderBy(t => t.Reviews.Any() ? t.Reviews.Average(r => r.Rating) : 0)
                              .ThenBy(t => t.CreatedAt)
                        : query.OrderByDescending(t => t.Reviews.Any() ? t.Reviews.Average(r => r.Rating) : 0)
                               .ThenByDescending(t => t.CreatedAt);
                    break;
                case "name":
                    query = searchDto.SortOrder?.ToLower() == "asc" 
                        ? query.OrderBy(t => t.Name) 
                        : query.OrderByDescending(t => t.Name);
                    break;
                case "price":
                    query = searchDto.SortOrder?.ToLower() == "asc" 
                        ? query.OrderBy(t => t.Price) 
                        : query.OrderByDescending(t => t.Price);
                    break;
                case "startdate":
                    query = searchDto.SortOrder?.ToLower() == "asc" 
                        ? query.OrderBy(t => t.StartDate) 
                        : query.OrderByDescending(t => t.StartDate);
                    break;
                case "enddate":
                    query = searchDto.SortOrder?.ToLower() == "asc" 
                        ? query.OrderBy(t => t.EndDate) 
                        : query.OrderByDescending(t => t.EndDate);
                    break;
                case "address":
                    query = searchDto.SortOrder?.ToLower() == "asc" 
                        ? query.OrderBy(t => t.Address) 
                        : query.OrderByDescending(t => t.Address);
                    break;
                default:
                    query = searchDto.SortOrder?.ToLower() == "asc" 
                        ? query.OrderBy(t => t.CreatedAt) 
                        : query.OrderByDescending(t => t.CreatedAt);
                    break;
            }

            // Phân trang
            var skip = (searchDto.Page - 1) * searchDto.PageSize;
            return await query
                .Skip(skip)
                .Take(searchDto.PageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalToursCountAsync(TourSearchDto searchDto)
        {
            var query = _context.Tours.AsQueryable();

            // Áp dụng cùng điều kiện tìm kiếm như SearchToursAsync
            if (!string.IsNullOrEmpty(searchDto.SearchKey))
            {
                query = query.Where(t => t.Name.Contains(searchDto.SearchKey) || t.Address.Contains(searchDto.SearchKey));
            }

            if (!string.IsNullOrEmpty(searchDto.Address))
            {
                query = query.Where(t => t.Address.Contains(searchDto.Address));
            }

            if (searchDto.MinPrice.HasValue)
            {
                query = query.Where(t => t.Price >= searchDto.MinPrice.Value);
            }

            if (searchDto.MaxPrice.HasValue)
            {
                query = query.Where(t => t.Price <= searchDto.MaxPrice.Value);
            }

            if (searchDto.StartDateFrom.HasValue)
            {
                query = query.Where(t => t.StartDate >= searchDto.StartDateFrom.Value);
            }

            if (searchDto.StartDateTo.HasValue)
            {
                query = query.Where(t => t.StartDate <= searchDto.StartDateTo.Value);
            }

            if (searchDto.EndDateFrom.HasValue)
            {
                query = query.Where(t => t.EndDate >= searchDto.EndDateFrom.Value);
            }

            if (searchDto.EndDateTo.HasValue)
            {
                query = query.Where(t => t.EndDate <= searchDto.EndDateTo.Value);
            }

            if (!string.IsNullOrEmpty(searchDto.Status))
            {
                query = query.Where(t => t.Status == searchDto.Status);
            }

            if (searchDto.HostId.HasValue)
            {
                query = query.Where(t => t.HostId == searchDto.HostId.Value);
            }

            return await query.CountAsync();
        }

        public async Task<bool> TourExistsAsync(int id)
        {
            return await _context.Tours.AnyAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Tour>> GetToursByHostIdAsync(int hostId)
        {
            return await _context.Tours
                .Include(t => t.Host)
                .Include(t => t.Reviews)
                .Where(t => t.HostId == hostId)
                .OrderByDescending(t => t.Reviews.Any() ? t.Reviews.Average(r => r.Rating) : 0)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Tour>> GetAvailableToursAsync()
        {
            return await _context.Tours
                .Include(t => t.Host)
                .Include(t => t.Reviews)
                .Where(t => t.Status == "open" && t.AvailableSlots > 0 && t.StartDate > DateTime.Now)
                .OrderByDescending(t => t.Reviews.Any() ? t.Reviews.Average(r => r.Rating) : 0)
                .ThenBy(t => t.StartDate)
                .ToListAsync();
        }
    }
}

