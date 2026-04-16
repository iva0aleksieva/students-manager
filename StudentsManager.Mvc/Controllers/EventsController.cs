using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentsManager.Mvc.Domain.Entities;
using StudentsManager.Mvc.Domain.Inputs;
using StudentsManager.Mvc.Persistence;

namespace StudentsManager.Mvc.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EventsController : ControllerBase
{
    private readonly ManagerDbContext _dbContext;

    public EventsController(ManagerDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetByUser(string userId)
    {
        var result = await _dbContext
            .Events
            .Where(@event => @event.UserId == userId)
            .ToListAsync();

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(EventInput input)
    {
        var entity = new Event
        {
            Id = Guid.NewGuid(),
            UserId = input.UserId,
            DatetimeUtc = DateTime.UtcNow,
            Type = input.Type,
            Data = input.Data
        };
        _dbContext.Events.Add(entity);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByUser), new { userId = entity.UserId }, entity);
    }

}
