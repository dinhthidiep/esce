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
            if (string.IsNullOrEmpty(loginGoogleRequest.IdToken))
                return Unauthorized("Invalid credentials.");
            var payload = await _userService.VerifyGoogleTokenAsync(loginGoogleRequest.IdToken);
            if (payload == null || string.IsNullOrEmpty(payload.Email))
                return Unauthorized("Invalid credentials.");

            var user = await _userService.GetUserByUsernameAsync(payload.Email);
            if (user == null)
            {
                if (loginGoogleRequest.RoleId == null || (loginGoogleRequest.RoleId != 3 && loginGoogleRequest.RoleId != 4))
                {
                    return Ok(new LoginResponseDto());
                }
                else
                {
                    var registerUserDto = new RegisterUserDto
                    {
                        FullName = payload.Name ?? payload.Email,
                        UserEmail = payload.Email,
                        Password = Guid.NewGuid().ToString(),
                        RoleId = loginGoogleRequest.RoleId ?? 0,
                        Phone = loginGoogleRequest.PhoneNumber ?? ""
                    };
                    await _userService.CreateUserAsync(registerUserDto, false, true);
                    user = await _userService.GetUserByUsernameAsync(payload.Email);
                }
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

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto user)
        {
            var existingUser = await _userService.GetUserByUsernameAsync(user.UserEmail);
            if (existingUser != null) return BadRequest("Username already exists.");

            if (user.RoleId != 3 && user.RoleId != 4) // Kiểm tra Host (3) hoặc Customer (4)
            {
                return BadRequest("Invalid role. Only Host or Customer roles are allowed.");
            }

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