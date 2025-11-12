using ESCE_SYSTEM.Services.RoleService;
using ESCE_SYSTEM.Services.UserService;
using ESCE_SYSTEM.DTOs;
using ESCE_SYSTEM.DTOs.Users;
using ESCE_SYSTEM.Helper;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using ESCE_SYSTEM.Helpers;


namespace ESCE_SYSTEM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IRoleService _roleService;
        private readonly JwtHelper _jwtHelper;

        public AuthController(IUserService userService, IRoleService roleService, JwtHelper jwtHelper)
        {
            _userService = userService;
            _roleService = roleService;
            _jwtHelper = jwtHelper;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto loginRequest)
        {
            try
            {
                var user = await _userService.GetUserByUsernameAsync(loginRequest.UserEmail);
                if (user == null || !_userService.VerifyPassword(loginRequest.Password, user.PasswordHash))
                    return Unauthorized("Email hoặc mật khẩu không đúng.");

                //  QUAN TRỌNG: THÊM KIỂM TRA TRẠNG THÁI TÀI KHOẢN
                if (user.IsBanned)
                {
                    return Unauthorized("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
                }

                if (user.IsActive != true)
                {
                    return Unauthorized("Tài khoản của bạn chưa được kích hoạt. Vui lòng liên hệ quản trị viên.");
                }

                var role = await _roleService.GetRoleById(user.RoleId);

                var token = _jwtHelper.GenerateToken(new UserTokenDto
                {
                    Id = user.Id.ToString(),
                    UserEmail = user.Email,
                    Role = role.Name
                });

                return Ok(new { token, UserInfo = user.Adapt<UserProfileDto>() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("logingoogle")]
        public async Task<IActionResult> LoginGoogle([FromBody] LoginGoogleDto loginGoogleRequest)
        {
            try
            {
                var payload = await _userService.VerifyGoogleTokenAsync(loginGoogleRequest.IdToken);
                if (payload == null || string.IsNullOrEmpty(payload.Email))
                    return Unauthorized("Invalid credentials.");

                var user = await _userService.GetUserByUsernameAsync(payload.Email);
                if (user == null)
                {
                    // 🟢 Logic: Đăng ký Google mới luôn là Role 4
                    var registerUserDto = new RegisterUserDto
                    {
                        FullName = payload.Name ?? payload.Email,
                        UserEmail = payload.Email,
                        Password = Guid.NewGuid().ToString(),
                        Phone = loginGoogleRequest.PhoneNumber ?? ""
                    };
                    await _userService.CreateUserAsync(registerUserDto, false, true);
                    user = await _userService.GetUserByUsernameAsync(payload.Email);
                }

                //  QUAN TRỌNG: THÊM KIỂM TRA TRẠNG THÁI TÀI KHOẢN CHO GOOGLE LOGIN
                if (user.IsBanned)
                {
                    return Unauthorized("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
                }

                if (user.IsActive != true)
                {
                    return Unauthorized("Tài khoản của bạn chưa được kích hoạt. Vui lòng liên hệ quản trị viên.");
                }

                var role = await _roleService.GetRoleById(user.RoleId);
                var token = _jwtHelper.GenerateToken(new UserTokenDto
                {
                    Id = user.Id.ToString(),
                    UserEmail = user.Email,
                    Role = role.Name
                });

                return Ok(new LoginResponseDto { Token = token, UserInfo = user.Adapt<UserProfileDto>() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto user)
        {
            var existingUser = await _userService.GetUserByUsernameAsync(user.UserEmail);
            if (existingUser != null) return BadRequest("Username already exists.");

            // 🔴 Thay đổi quan trọng: Gán RoleId mặc định là 4 (Customer) khi đăng ký thường
           // user.RoleId = 4;

            // ❌ Bỏ qua kiểm tra role cũ: if (user.RoleId != 3 && user.RoleId != 4) {...}

            try
            {
                await _userService.CreateUserAsync(user, true, false);
                return Ok("User registered successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("RequestOtp")]
        public async Task<IActionResult> RequestOtp([FromBody] RequestOtpDto requestOtpDto)
        {
            try
            {
                await _userService.RequestOtp(requestOtpDto);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("VerifyOtp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto user)
        {
            try
            {
                var result = await _userService.VerifyOtp(user);
                return Ok("Verify successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("CheckEmail/{email}")]
        public async Task<IActionResult> CheckEmail(string email)
        {
            try
            {
                var existingUser = await _userService.GetUserByUsernameAsync(email);
                return Ok(new CheckExistingEmailDto { IsExisting = existingUser != null });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("ChangePassword")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePassword)
        {
            try
            {
                await _userService.ChangePassword(changePassword);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("RequestOtpForgetPassword")]
        public async Task<IActionResult> RequestOtpForgetPassword([FromBody] RequestOtpDto requestOtpDto)
        {
            try
            {
                await _userService.RequestOtpForgetPassword(requestOtpDto);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("ResetPassword")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPassword)
        {
            try
            {
                await _userService.ResetPassword(resetPassword);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}