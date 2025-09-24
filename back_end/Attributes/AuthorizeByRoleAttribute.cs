using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace ESCE_SYSTEM.Attributes
{
    public class AuthorizeByRoleAttribute : Attribute, IAuthorizationFilter
    {
        private readonly int[] _allowedRoles;

        public AuthorizeByRoleAttribute(params int[] allowedRoles)
        {
            _allowedRoles = allowedRoles;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Kiểm tra xem user đã đăng nhập chưa
            if (!context.HttpContext.User.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Lấy role từ claims
            var roleClaim = context.HttpContext.User.FindFirst(ClaimTypes.Role);
            if (roleClaim == null || !int.TryParse(roleClaim.Value, out int userRole))
            {
                context.Result = new ForbidResult();
                return;
            }

            // Kiểm tra role có được phép không
            if (!_allowedRoles.Contains(userRole))
            {
                context.Result = new ForbidResult();
                return;
            }
        }
    }
}
