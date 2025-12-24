using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StudentsManager.Mvc.Configurations;
using StudentsManager.Mvc.Domain.Entities;
using StudentsManager.Mvc.Domain.Inputs.Students;
using StudentsManager.Mvc.Domain.Views.Students;
using StudentsManager.Mvc.Persistence;

namespace StudentsManager.Mvc.Services.Students
{
    public class StudentsService(ManagerDbContext dbContext, UserManager<User> userManager) : IStudentsService
    {
        public async Task<List<StudentView?>> AllAsync() => 
            (await dbContext
                .Users
                .Where(user => user.IsDeleted == false)
                .ToListAsync())
            .Select(user => user.ToView())
            .ToList();

        public async Task<StudentView?> GetByFacultyNumberAsync(string facultyNumber)
        {
            return (await dbContext
                .Users
                .FirstOrDefaultAsync(user => user.FacultyNumber == facultyNumber))
                .ToView();
        }

        public async Task<StudentView?> UpdatePictureAsync(UpdatePicture input)
        {
            var user = await GetUserByFacultyNumberAsync(input.FacultyNumber);
            if (user == null)
            {
                return null;
            }
            var isPasswordCorrect = await userManager.CheckPasswordAsync(user, input.Password);
            if (!isPasswordCorrect)
            {
                return null;
            }
            user.Base64EncodePicture = input.Picture;
            dbContext.Users.Update(user);
            await dbContext.SaveChangesAsync();

            return user.ToView();
        }

        public async Task<StudentProfileView?> GetStudentProfileViewAsync(Guid studentId)
        {
            var student = await dbContext
                .Users
                .Select(user => new
                {
                    user.Id,
                    user.FullName,
                    user.Base64EncodePicture,
                    user.FacultyNumber,
                })
                .FirstOrDefaultAsync(user => user.Id == studentId);

            if (student == null)
            {
                return null;
            }

            var userAnswers = await dbContext
                .UserAnswers
                .Where(answer => answer.UserId == studentId)
                .Include(answer => answer.QuestionOption)
                .ThenInclude(option => option!.TestQuestion)
                .ToListAsync();

            var list = new List<ProfileTestQuestionOption>();
            foreach (var userAnswer in userAnswers)
            {
                if (userAnswer.QuestionOption?.TestQuestion == null)
                {
                    continue;
                }

                list.Add(new ProfileTestQuestionOption(
                    userAnswer.QuestionOption.TestQuestion.Description,
                    userAnswer.QuestionOption.Description,
                    userAnswer.QuestionOption.IsCorrect));
            }

            return new StudentProfileView(
                student.Id,
                student.FullName,
                student.Base64EncodePicture,
                student.FacultyNumber,
                list);
        }

        private Task<User?> GetUserByFacultyNumberAsync(string facultyNumber) =>
            dbContext
                .Users
                .FirstOrDefaultAsync(user => user.FacultyNumber == facultyNumber);
    }

    public record struct StudentProfileView(
        Guid Id,
        string FullName,
        string? Base64EncodePicture,
        string FacultyNumber,
        List<ProfileTestQuestionOption> TestQuestions);

    public record struct ProfileTestQuestionOption(
        string TestQuestionDescription,
        string QuestionOptionDescription,
        bool WasCorrect);
}
