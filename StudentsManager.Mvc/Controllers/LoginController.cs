using Microsoft.AspNetCore.Mvc;
using StudentsManager.Mvc.Controllers._Base;
using StudentsManager.Mvc.Domain.Inputs.Auth;
using StudentsManager.Mvc.Services.Auth;

namespace StudentsManager.Mvc.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LoginController(IAuthService service) : BaseController
{
    /// <summary>
    /// API endpoint for user login.
    /// </summary>
    /// <param name="credentials"></param>
    /// <returns>
    /// Ok (200) with the user ID if the login is successful.
    /// </returns>
    /// <returns>
    /// Unauthorized (401) if the email or password is invalid.
    /// </returns>
    [HttpPost]
    public async Task<IActionResult> Login([FromBody] Credentials credentials)
    {
        var result = await service.LoginAsync(credentials);
        if (result == null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }
        return Ok(new { userId = result.Id });
    }
}
