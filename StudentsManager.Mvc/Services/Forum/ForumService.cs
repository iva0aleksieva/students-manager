using Microsoft.EntityFrameworkCore;
using StudentsManager.Mvc.Domain.CustomDataStructures;
using StudentsManager.Mvc.Domain.Entities;
using StudentsManager.Mvc.Domain.Inputs.Forum;
using StudentsManager.Mvc.Persistence;

namespace StudentsManager.Mvc.Services.Forum
{
    public class ForumService : IForumService
    {
        private readonly ManagerDbContext _dbContext;

        public ForumService(ManagerDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        private IQueryable<ForumQuestion> ForumQuestionsWithComments =>
            _dbContext
                .ForumQuestions
                .AsNoTracking()
                .Include(question => question.Comments)
                .OrderByDescending(question => question.Id);

        public Task<List<ForumQuestion>> GetAsync(int limit = 20, int skip = 0)
        {
            return ForumQuestionsWithComments
                .Take(limit)
                .Skip(skip)
                .ToListAsync();
        }

        public Task<PaginatedList<ForumQuestion>> GetPaginatedListAsync(int pageIndex = 1)
        {
            return PaginatedList<ForumQuestion>.CreateAsync(ForumQuestionsWithComments, pageIndex, 5);
        }

        public async Task<ForumQuestion> SaveQuestionAsync(string question, Guid userId)
        {
            var entity = new ForumQuestion
            {
                Description = question,
                UserId = userId
            };
            var entry = await _dbContext.ForumQuestions.AddAsync(entity);
            await _dbContext.SaveChangesAsync();
            return entry.Entity;
        }

        public async Task<ForumComment> SaveCommentAsync(Comment input, Guid userId)
        {
            var entity = new ForumComment
            {
                Description = input.Description,
                ForumQuestionId = input.ForumQuestionId,
                UserId = userId
            };
            await _dbContext.ForumComments.AddAsync(entity);
            await _dbContext.SaveChangesAsync();
            return entity;
        }

        public Task<List<string>> GetSlidoQuestionsAsync(int limit = 20, int skip = 0)
        {
            return _dbContext
                .ForumQuestions
                .AsNoTracking()
                .OrderByDescending(question => question.Id)
                .Select(question => question.Description)
                .Take(limit)
                .Skip(skip)
                .ToListAsync();
        }
    }
}
