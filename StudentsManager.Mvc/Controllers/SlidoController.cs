using Microsoft.AspNetCore.Mvc;
using StudentsManager.Mvc.Domain.Inputs.Forum;
using StudentsManager.Mvc.Services.Auth;
using StudentsManager.Mvc.Services.Forum;

namespace StudentsManager.Mvc.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SlidoController : ControllerBase
    {
        private readonly IForumService _service;

        private readonly record struct QuestionInput(string Question);

        public SlidoController(IForumService service)
        {
            _service = service;
        }

        // GET: api/Slido/questions/20/0
        [HttpGet("questions/{limit:int}/{skip:int}")]
        public async Task<IActionResult> GetQuestions([FromRoute] int limit, [FromRoute] int skip)
        {
            var result = await _service.GetAsync(limit, skip);
            return Ok(result);
        }

        // POST: api/Slido/question
        [HttpPost("question")]
        public async Task<IActionResult> PostQuestion([FromBody] QuestionInput input)
        {
            if (string.IsNullOrWhiteSpace(input.Question))
                return BadRequest("Question cannot be empty");

            await _service.SaveQuestionAsync(
                input.Question,
                Guid.Parse("1eac9820-5e6e-4d10-6e94-08de36f40f78"));

            return Ok("Question posted successfully");
        }
    }
}

public readonly record struct QuestionInput(string Question);
