using CodeFlow.Api.Data;
using CodeFlow.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CodeFlow.Api.Tests;

internal static class TestDbContextFactory
{
    public static AppDbContext Create(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(options);
        db.Database.EnsureCreated();
        return db;
    }

    public static async Task<(AppDbContext Db, User User, Lesson Lesson, Faction Faction)> SeedBasicAsync()
    {
        var db = Create();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@codeflow.io",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            DisplayName = "TestUser",
            CreatedAtUtc = DateTime.UtcNow,
            TotalXp = 500,
            Role = Role.User
        };

        var course = new Course
        {
            Id = 1,
            Title = "Test Course",
            Description = "Desc",
            Level = "Test",
            Color = "green",
            TotalLessons = 1
        };

        var lesson = new Lesson
        {
            Id = 1,
            CourseId = 1,
            Chapter = "Глава 1: Сигнал",
            Title = "Test Lesson",
            Description = "Desc",
            Task = "Task",
            InitialCode = "",
            ExpectedOutput = "OK",
            Xp = 100,
            IsBoss = false,
            HasDebugger = false,
            Hint = "Hint 1",
            Hint2 = "Hint 2"
        };

        var bossLesson = new Lesson
        {
            Id = 4,
            CourseId = 1,
            Chapter = "Глава 1: Сигнал",
            Title = "Boss",
            Description = "Desc",
            Task = "Task",
            InitialCode = "",
            ExpectedOutput = "BOSS",
            Xp = 250,
            IsBoss = true,
            HasDebugger = false,
            Hint = "H1",
            Hint2 = "H2"
        };

        var faction = new Faction
        {
            Id = "data_brokers",
            Name = "Data Brokers",
            Description = "Desc",
            Icon = "💾",
            Color = "blue",
            Bonus = "+10%",
            RequiredRep = 0
        };

        db.Users.Add(user);
        db.Courses.Add(course);
        db.Lessons.AddRange(lesson, bossLesson);
        db.Factions.Add(faction);
        await db.SaveChangesAsync();

        return (db, user, lesson, faction);
    }
}
