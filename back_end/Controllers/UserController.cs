using ESCE_SYSTEM.DTOs.BanUnbanUser;
using ESCE_SYSTEM.DTOs.Certificates;
using ESCE_SYSTEM.Services.RoleService;
using ESCE_SYSTEM.Services.UserService;
using ESCE_SYSTEM.DTOs.Users;
using ESCE_SYSTEM.Helpers;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Repositories.UserRepository;
using ESCE_SYSTEM.Services.UserContextService;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using System.Security.Claims;


namespace ESCE_SYSTEM.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase // Đã sửa lại thành ControllerBase cho phù hợp
    {
        private readonly IUserService _userService;
        private readonly IUserContextService _userContextService;
        // Thêm các dependencies khác nếu cần (ví dụ: IConfiguration, ICampaignService từ code cũ)
        // private readonly IConfiguration _configuration;
        // private readonly ICampaignService _campaignService; 

        public UserController(IUserService userService, IUserContextService userContextService /*, ...*/)
        {
            _userService = userService;
            _userContextService = userContextService;
            // ...
        }

        // ---------- 🟢 CHỨC NĂNG YÊU CẦU NÂNG CẤP ROLE (CUSTOMER/ROLE 4 ONLY) 🟢 ----------

        [HttpPost("RequestUpgradeToAgency")]
        [Authorize(Roles = "Customer")] // Role 4
        public async Task<IActionResult> RequestUpgradeToAgency([FromBody] RequestAgencyUpgradeDto requestDto)
        {
            try
            {
                // Lấy User ID từ UserContextService hoặc Claims
                var userIdString = _userContextService.UserId;
                if (!int.TryParse(userIdString, out var userId))
                    return Unauthorized("Thông tin người dùng không hợp lệ.");

                await _userService.RequestUpgradeToAgencyAsync(userId, requestDto);
                return Ok("Yêu cầu nâng cấp lên Agency (Role 3) đã được gửi thành công. Vui lòng chờ Admin duyệt.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("RequestUpgradeToHost")]
        [Authorize(Roles = "Customer")] // Role 4
        public async Task<IActionResult> RequestUpgradeToHost([FromBody] RequestHostUpgradeDto requestDto)
        {
            try
            {
                // Lấy User ID từ UserContextService hoặc Claims
                var userIdString = _userContextService.UserId;
                if (!int.TryParse(userIdString, out var userId))
                    return Unauthorized("Thông tin người dùng không hợp lệ.");

                await _userService.RequestUpgradeToHostAsync(userId, requestDto);
                return Ok("Yêu cầu nâng cấp lên Host (Role 2) đã được gửi thành công. Vui lòng chờ Admin duyệt.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ---

        // ---------- 🟢 CHỨC NĂNG DUYỆT ROLE (ADMIN/ROLE 1 ONLY) 🟢 ----------

        // 1. PHÊ DUYỆT (Approve)
        [HttpPut("ApproveCertificate")]
        [Authorize(Roles = "Admin")] // 🔴 Phân quyền chỉ Admin
        public async Task<IActionResult> ApproveCertificate([FromBody] ApproveCertificateDto dto)
        {
            try
            {
                await _userService.ApproveUpgradeCertificateAsync(dto);
                return Ok("Chứng nhận đã được phê duyệt thành công.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // 2. TỪ CHỐI (Reject)
        [HttpPut("RejectCertificate")]
        [Authorize(Roles = "Admin")] // 🔴 Phân quyền chỉ Admin
        public async Task<IActionResult> RejectCertificate([FromBody] RejectCertificateDto dto)
        {
            try
            {
                await _userService.RejectUpgradeCertificateAsync(dto);
                return Ok("Chứng nhận đã bị từ chối.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // 3. YÊU CẦU BỔ SUNG (Review)
        [HttpPut("ReviewCertificate")]
        [Authorize(Roles = "Admin")] // 🔴 Phân quyền chỉ Admin
        public async Task<IActionResult> ReviewCertificate([FromBody] ReviewCertificateDto dto)
        {
            try
            {
                await _userService.ReviewUpgradeCertificateAsync(dto);
                return Ok("Yêu cầu bổ sung thông tin đã được gửi.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ---

        // ---------- 🟢 CHỨC NĂNG CẤM/BỎ CẤM TÀI KHOẢN (ADMIN/ROLE 1 ONLY) 🟢 ----------

        [HttpPut("ban-account")]
        [Authorize(Roles = "Admin")] // 🔴 Phân quyền chỉ Admin
        public async Task<IActionResult> BanAccount([FromBody] BanAccountDto banAccountDto)
        {
            try
            {
                // AccountId trong DTO được giả định là int
                await _userService.BanAccount(banAccountDto.AccountId, banAccountDto.Reason);
                return Ok("Tài khoản đã bị cấm.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("unban-account")]
        [Authorize(Roles = "Admin")] // 🔴 Phân quyền chỉ Admin
        public async Task<IActionResult> UnbanAccount([FromBody] UnbanAccountDto unbanAccountDto)
        {
            try
            {
                await _userService.UnbanAccount(unbanAccountDto.AccountId);
                return Ok("Tài khoản đã được bỏ cấm.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ---

        // ***************************************************************
        // CÁC ENDPOINT KHÁC TỪ DỰ ÁN CŨ CẦN ĐƯỢC THÊM VÀO ĐÂY (NẾU CẦN)
        // Ví dụ: GetAllUser, GetAccountById, AddUser, UpdateProfile, vv.
        // ***************************************************************
    }
}