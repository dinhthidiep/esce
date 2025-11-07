using System;
using System.Collections.Generic;

namespace ESCE_SYSTEM.DTOs.Post
{
    public class TourComboDetailResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int AvailableSlots { get; set; }
        public string? Image { get; set; }
        public string? Status { get; set; }
        public string? CancellationPolicy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public HostInfoDto Host { get; set; } = new HostInfoDto();
        public List<ServiceInfoDto> Services { get; set; } = new List<ServiceInfoDto>();
        public List<ReviewInfoDto> Reviews { get; set; } = new List<ReviewInfoDto>();
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
    }

    public class HostInfoDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
    }

    public class ServiceInfoDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }

    public class ReviewInfoDto
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public AuthorInfoDto Author { get; set; } = new AuthorInfoDto();
        public List<ReviewInfoDto> Replies { get; set; } = new List<ReviewInfoDto>();
    }

    public class AuthorInfoDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Avatar { get; set; }
    }
}

