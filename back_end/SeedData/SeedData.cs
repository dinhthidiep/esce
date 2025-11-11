using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Repositories.RoleRepository;
using ESCE_SYSTEM.Repositories.UserRepository;
using ESCE_SYSTEM.Services.RoleService;
using ESCE_SYSTEM.Services.UserService;
using ESCE_SYSTEM.DTOs.Users;
using ESCE_SYSTEM.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ESCE_SYSTEM.SeedData
{
    public class SeedData
    {
        public static async Task Initialize(
            IUserService userService,
            IRoleService roleService,
            IRoleRepository roleRepository,
            IUserRepository userRepository,
            ESCEContext dbContext)
        {
            // Seed Roles

            // Role 1: Admin
            var roleAdmin = await roleService.GetRoleByName("Admin");
            if (roleAdmin == null)
            {
                await roleRepository.AddAsync(new Role
                {
                    Name = "Admin",
                    Description = "Quản trị viên hệ thống"
                });
            }


            var roleHost = await roleService.GetRoleByName("Host");
            if (roleHost == null)
            {
                await roleRepository.AddAsync(new Role
                {
                    Name = "Host",
                    Description = "Chủ farm/Người tổ chức tour" // Role 2
                });
            }


            var roleAgency = await roleService.GetRoleByName("Agency");
            if (roleAgency == null)
            {
                await roleRepository.AddAsync(new Role
                {
                    Name = "Agency", // Role 3
                    Description = "Người dùng đặt tour cho nhiều người/Công ty"
                });
            }

            // Role 4: Customer
            var roleCustomer = await roleService.GetRoleByName("Customer");
            if (roleCustomer == null)
            {
                await roleRepository.AddAsync(new Role
                {
                    Name = "Customer",
                    Description = "Người dùng tham gia tour cá nhân"
                });
            }

            // Seed Admin Account

            var admin = await userService.GetUserByUsernameAsync("admin@gmail.com");
            if (admin == null)
            {
                var newAdmin = new RegisterUserDto
                {
                    UserEmail = "admin@gmail.com",
                    Password = "123456",
                    FullName = "System Admin",
                    Phone = "123456789"

                };

                await userService.CreateUserAsync(newAdmin, false, false,1);
            }

            // Seed Customer Account

            var customer = await userService.GetUserByUsernameAsync("user@gmail.com");
            if (customer == null)
            {
                var newCustomer = new RegisterUserDto
                {
                    UserEmail = "user@gmail.com",
                    Password = "123456",
                    FullName = "Customer User",
                    Phone = "0987654321"

                };

                await userService.CreateUserAsync(newCustomer, false, false, 4);
            }

            // Seed Host Account
            var host = await userService.GetUserByUsernameAsync("host@gmail.com");
            if (host == null)
            {
                var newHost = new RegisterUserDto
                {
                    UserEmail = "host@gmail.com",
                    Password = "123456",
                    FullName = "Dalat Farm Tours",
                    Phone = "0901234567"
                };

                await userService.CreateUserAsync(newHost, false, false, 2);
            }

            // Get Host ID for tours
            var hostAccount = await userRepository.GetByEmailAsync("host@gmail.com");
            if (hostAccount == null) return;

            int hostId = hostAccount.Id;

            // ============================================
            // SEED SERVICES (Tour đơn lẻ - Nguyên liệu)
            // ============================================

            if (!await dbContext.Services.AnyAsync())
            {
                var services = new List<Service>
                {
                    new Service
                    {
                        Name = "Tham quan vườn dâu Đà Lạt",
                        Description = "Trải nghiệm hái dâu tươi tại vườn dâu organic Đà Lạt",
                        Price = 150000,
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Service
                    {
                        Name = "Câu cá hồ Tuyền Lâm",
                        Description = "Câu cá thư giãn tại hồ Tuyền Lâm thơ mộng",
                        Price = 200000,
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Service
                    {
                        Name = "BBQ ngoài trời",
                        Description = "Tiệc BBQ ngoài trời với thực phẩm tươi ngon",
                        Price = 300000,
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Service
                    {
                        Name = "Tham quan làng hoa Vạn Thành",
                        Description = "Khám phá làng hoa nổi tiếng Đà Lạt",
                        Price = 100000,
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Service
                    {
                        Name = "Cắm trại qua đêm",
                        Description = "Cắm trại qua đêm với lửa trại và hoạt động team building",
                        Price = 500000,
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Service
                    {
                        Name = "Tham quan đồi chè Cầu Đất",
                        Description = "Ngắm cảnh đồi chè xanh mướt và chụp ảnh sống ảo",
                        Price = 120000,
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Service
                    {
                        Name = "Trekking Fansipan",
                        Description = "Leo núi chinh phục đỉnh Fansipan 3143m",
                        Price = 800000,
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Service
                    {
                        Name = "Tham quan bản Cát Cát",
                        Description = "Khám phá văn hóa dân tộc H'Mông tại bản Cát Cát",
                        Price = 150000,
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Service
                    {
                        Name = "Lặn ngắm san hô",
                        Description = "Lặn biển ngắm san hô tại Phú Quốc",
                        Price = 600000,
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Service
                    {
                        Name = "Tour câu mực đêm",
                        Description = "Trải nghiệm câu mực đêm trên biển Phú Quốc",
                        Price = 400000,
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Service
                    {
                        Name = "Du thuyền Hạ Long",
                        Description = "Du thuyền 5 sao trên vịnh Hạ Long",
                        Price = 1200000,
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Service
                    {
                        Name = "Tham quan hang Sửng Sốt",
                        Description = "Khám phá hang động kỳ vĩ nhất vịnh Hạ Long",
                        Price = 200000,
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };

                await dbContext.Services.AddRangeAsync(services);
                await dbContext.SaveChangesAsync();
            }

            // ============================================
            // SEED SERVICECOMBOS (Tour Combo - Sản phẩm)
            // ============================================

            if (!await dbContext.Servicecombos.AnyAsync())
            {
                var combos = new List<Servicecombo>
                {
                    new Servicecombo
                    {
                        Name = "Tour Đà Lạt 2N1Đ - Trải nghiệm Farm",
                        Address = "Đà Lạt, Lâm Đồng",
                        Description = "Khám phá vẻ đẹp Đà Lạt với trải nghiệm farm, hái dâu và BBQ. Tour 2 ngày 1 đêm đầy thú vị cho gia đình và bạn bè.",
                        Price = 1500000,
                        AvailableSlots = 20,
                        Image = "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=800",
                        Status = "open",
                        CancellationPolicy = "Hoàn 100% nếu hủy trước 7 ngày, 50% nếu hủy trước 3 ngày",
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Servicecombo
                    {
                        Name = "Tour Đà Lạt 3N2Đ - Khám phá thiên nhiên",
                        Address = "Đà Lạt, Lâm Đồng",
                        Description = "Tour 3 ngày 2 đêm khám phá thiên nhiên Đà Lạt: hồ Tuyền Lâm, đồi chè, làng hoa. Bao gồm cắm trại qua đêm và nhiều hoạt động thú vị.",
                        Price = 2800000,
                        AvailableSlots = 15,
                        Image = "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
                        Status = "open",
                        CancellationPolicy = "Hoàn 100% nếu hủy trước 10 ngày, 50% nếu hủy trước 5 ngày",
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Servicecombo
                    {
                        Name = "Tour Đà Lạt 1 ngày - Vườn dâu & Làng hoa",
                        Address = "Đà Lạt, Lâm Đồng",
                        Description = "Tour 1 ngày tham quan vườn dâu và làng hoa Vạn Thành. Phù hợp cho những ai muốn trải nghiệm ngắn ngày.",
                        Price = 650000,
                        AvailableSlots = 30,
                        Image = "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
                        Status = "open",
                        CancellationPolicy = "Hoàn 100% nếu hủy trước 2 ngày",
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Servicecombo
                    {
                        Name = "Tour Sapa 3N2Đ - Chinh phục Fansipan",
                        Address = "Sapa, Lào Cai",
                        Description = "Chinh phục nóc nhà Đông Dương, tham quan bản làng dân tộc, ngắm ruộng bậc thang tuyệt đẹp.",
                        Price = 3500000,
                        AvailableSlots = 12,
                        Image = "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
                        Status = "open",
                        CancellationPolicy = "Hoàn 80% nếu hủy trước 7 ngày, 40% nếu hủy trước 3 ngày",
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Servicecombo
                    {
                        Name = "Tour Phú Quốc 4N3Đ - Thiên đường biển đảo",
                        Address = "Phú Quốc, Kiên Giang",
                        Description = "Khám phá đảo ngọc Phú Quốc với bãi biển tuyệt đẹp, lặn ngắm san hô, thưởng thức hải sản tươi sống.",
                        Price = 4200000,
                        AvailableSlots = 18,
                        Image = "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
                        Status = "open",
                        CancellationPolicy = "Hoàn 100% nếu hủy trước 14 ngày, 50% nếu hủy trước 7 ngày",
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Servicecombo
                    {
                        Name = "Tour Hạ Long 2N1Đ - Kỳ quan thế giới",
                        Address = "Vịnh Hạ Long, Quảng Ninh",
                        Description = "Du thuyền qua đêm trên vịnh Hạ Long, tham quan hang động, chèo kayak, bơi lội và ngắm hoàng hôn tuyệt đẹp.",
                        Price = 2200000,
                        AvailableSlots = 25,
                        Image = "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
                        Status = "open",
                        CancellationPolicy = "Hoàn 100% nếu hủy trước 5 ngày, 50% nếu hủy trước 2 ngày",
                        HostId = hostId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };

                await dbContext.Servicecombos.AddRangeAsync(combos);
                await dbContext.SaveChangesAsync();

                // ============================================
                // SEED SERVICECOMBO DETAILS (Liên kết Combo với Services)
                // ============================================

                var allServices = await dbContext.Services.ToListAsync();
                var allCombos = await dbContext.Servicecombos.ToListAsync();

                if (allServices.Count >= 12 && allCombos.Count >= 6)
                {
                    var comboDetails = new List<ServicecomboDetail>
                    {
                        // Tour Đà Lạt 2N1Đ = Vườn dâu + BBQ
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[0].Id,
                            ServiceId = allServices[0].Id,
                            Quantity = 1
                        },
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[0].Id,
                            ServiceId = allServices[2].Id,
                            Quantity = 1
                        },

                        // Tour Đà Lạt 3N2Đ = Câu cá + Cắm trại + Đồi chè
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[1].Id,
                            ServiceId = allServices[1].Id,
                            Quantity = 1
                        },
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[1].Id,
                            ServiceId = allServices[4].Id,
                            Quantity = 1
                        },
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[1].Id,
                            ServiceId = allServices[5].Id,
                            Quantity = 1
                        },

                        // Tour Đà Lạt 1 ngày = Vườn dâu + Làng hoa
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[2].Id,
                            ServiceId = allServices[0].Id,
                            Quantity = 1
                        },
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[2].Id,
                            ServiceId = allServices[3].Id,
                            Quantity = 1
                        },

                        // Tour Sapa 3N2Đ = Trekking Fansipan + Bản Cát Cát
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[3].Id,
                            ServiceId = allServices[6].Id,
                            Quantity = 1
                        },
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[3].Id,
                            ServiceId = allServices[7].Id,
                            Quantity = 1
                        },
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[3].Id,
                            ServiceId = allServices[4].Id,
                            Quantity = 2
                        },

                        // Tour Phú Quốc 4N3Đ = Lặn san hô + Câu mực đêm
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[4].Id,
                            ServiceId = allServices[8].Id,
                            Quantity = 2
                        },
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[4].Id,
                            ServiceId = allServices[9].Id,
                            Quantity = 1
                        },

                        // Tour Hạ Long 2N1Đ = Du thuyền + Hang Sửng Sốt
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[5].Id,
                            ServiceId = allServices[10].Id,
                            Quantity = 1
                        },
                        new ServicecomboDetail
                        {
                            ServicecomboId = allCombos[5].Id,
                            ServiceId = allServices[11].Id,
                            Quantity = 1
                        }
                    };

                    await dbContext.ServicecomboDetails.AddRangeAsync(comboDetails);
                    await dbContext.SaveChangesAsync();
                }

                // ============================================
                // SEED REVIEWS (Đánh giá tour)
                // ============================================

                var customerAccount = await userRepository.GetByEmailAsync("user@gmail.com");
                if (customerAccount != null && !await dbContext.Reviews.AnyAsync())
                {
                    var reviews = new List<Review>
                    {
                        new Review
                        {
                            ComboId = allCombos[0].Id,
                            AuthorId = customerAccount.Id,
                            Rating = 5,
                            Content = "Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình, vườn dâu đẹp và dâu rất ngon. Sẽ quay lại lần sau.",
                            CreatedAt = DateTime.UtcNow.AddDays(-10)
                        },
                        new Review
                        {
                            ComboId = allCombos[0].Id,
                            AuthorId = customerAccount.Id,
                            Rating = 4,
                            Content = "Trải nghiệm tốt, BBQ ngon. Tuy nhiên thời tiết hơi mưa nên hơi bất tiện.",
                            CreatedAt = DateTime.UtcNow.AddDays(-5)
                        },
                        new Review
                        {
                            ComboId = allCombos[1].Id,
                            AuthorId = customerAccount.Id,
                            Rating = 5,
                            Content = "Tour 3 ngày 2 đêm rất đáng giá! Cắm trại qua đêm là trải nghiệm tuyệt vời nhất.",
                            CreatedAt = DateTime.UtcNow.AddDays(-15)
                        },
                        new Review
                        {
                            ComboId = allCombos[2].Id,
                            AuthorId = customerAccount.Id,
                            Rating = 5,
                            Content = "Tour 1 ngày phù hợp cho gia đình có trẻ nhỏ. Lịch trình vừa phải, không quá mệt.",
                            CreatedAt = DateTime.UtcNow.AddDays(-3)
                        },
                        new Review
                        {
                            ComboId = allCombos[3].Id,
                            AuthorId = customerAccount.Id,
                            Rating = 5,
                            Content = "Chinh phục Fansipan thành công! Hướng dẫn viên rất chuyên nghiệp và am hiểu địa phương.",
                            CreatedAt = DateTime.UtcNow.AddDays(-20)
                        },
                        new Review
                        {
                            ComboId = allCombos[4].Id,
                            AuthorId = customerAccount.Id,
                            Rating = 4,
                            Content = "Phú Quốc đẹp tuyệt vời! Lặn ngắm san hô rất thú vị. Hải sản tươi ngon.",
                            CreatedAt = DateTime.UtcNow.AddDays(-7)
                        },
                        new Review
                        {
                            ComboId = allCombos[5].Id,
                            AuthorId = customerAccount.Id,
                            Rating = 5,
                            Content = "Du thuyền Hạ Long sang trọng, phòng ốc sạch sẽ. Cảnh đẹp như mơ!",
                            CreatedAt = DateTime.UtcNow.AddDays(-2)
                        }
                    };

                    await dbContext.Reviews.AddRangeAsync(reviews);
                    await dbContext.SaveChangesAsync();

                    // Thêm replies từ Host
                    var savedReviews = await dbContext.Reviews.Where(r => r.ParentReviewId == null).ToListAsync();
                    if (savedReviews.Count > 0)
                    {
                        var replies = new List<Review>
                        {
                            new Review
                            {
                                ComboId = savedReviews[0].ComboId,
                                AuthorId = hostId,
                                ParentReviewId = savedReviews[0].Id,
                                Content = "Cảm ơn bạn đã đánh giá! Rất vui khi bạn hài lòng với tour của chúng tôi.",
                                CreatedAt = DateTime.UtcNow.AddDays(-9)
                            },
                            new Review
                            {
                                ComboId = savedReviews[2].ComboId,
                                AuthorId = hostId,
                                ParentReviewId = savedReviews[2].Id,
                                Content = "Cảm ơn bạn! Hy vọng sẽ được phục vụ bạn trong những chuyến đi tiếp theo.",
                                CreatedAt = DateTime.UtcNow.AddDays(-14)
                            }
                        };

                        await dbContext.Reviews.AddRangeAsync(replies);
                        await dbContext.SaveChangesAsync();
                    }
                }
            }
        }
    }
}