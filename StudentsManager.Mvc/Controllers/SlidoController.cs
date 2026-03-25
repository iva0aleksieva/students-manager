using Microsoft.AspNetCore.Mvc;
using StudentsManager.Mvc.Domain.Inputs.Forum;
using StudentsManager.Mvc.Services.Forum;

namespace StudentsManager.Mvc.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SlidoController(IForumService service) : ControllerBase
    {
        // GET: api/slido?limit=20&skip=0
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int limit, [FromQuery] int skip)
        {
            var forumQuestions = await service.GetAsync(limit, skip);
            var result = forumQuestions.Select(question => new QuestionCommentsView(
                question.Id,
                question.Description,
                question.Comments?.Select(comment => comment.Description).ToArray()
            )).ToList();
            return Ok(result);
        }

        // POST: api/slido/comment
        [HttpPost("comment")]
        public async Task<IActionResult> PostComment([FromBody] Comment input)
        {
            if (string.IsNullOrWhiteSpace(input.Description) || input.ForumQuestionId == 0)
                return BadRequest("Comment cannot be empty");

            await service.SaveCommentAsync(input,Guid.Parse("1eac9820-5e6e-4d10-6e94-08de36f40f78"));

            return Ok("Comment posted successfully");
        }
        
        // GET: api/slido/questions?limit=20&skip=0
        [HttpGet("questions")]
        public async Task<IActionResult> GetQuestions([FromQuery] int limit, [FromQuery] int skip)
        {
            var result = await service.GetSlidoQuestionsAsync(limit, skip);
            return Ok(result);
        }

        // POST: api/slido/question
        [HttpPost("question")]
        public async Task<IActionResult> PostQuestion([FromBody] QuestionInput input)
        {
            if (string.IsNullOrWhiteSpace(input.Question))
                return BadRequest("Question cannot be empty");

            await service.SaveQuestionAsync(
                input.Question,
                Guid.Parse("1eac9820-5e6e-4d10-6e94-08de36f40f78"));

            return Ok("Question posted successfully");
        }
    }

    public record struct QuestionInput(string Question);
    public record struct QuestionCommentsView(int ForumQuestionId, string ForumQuestionDescription, string[]? Comments);
}
