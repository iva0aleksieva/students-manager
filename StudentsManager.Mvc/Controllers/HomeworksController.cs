using Microsoft.AspNetCore.Mvc;
using StudentsManager.Mvc.Services.Homeworks;

namespace StudentsManager.Mvc.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeworksController : ControllerBase
    {
        private readonly IHomeworksService _homeworksService;

        public HomeworksController(IHomeworksService homeworksService)
        {
            _homeworksService = homeworksService;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetByUser(Guid userId)
        {
            var result = await _homeworksService.GetByUserAsync(userId);
            return Ok(result);
        }
    }
}