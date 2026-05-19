using CodeFlow.Api.DTOs;
using CodeFlow.Api.Models;
using CodeFlow.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace CodeFlow.Api.Tests;

public class ProgressServiceTests
{
    [Fact]
    public async Task CompleteLessonAsync_AddsXpAndProgress()
    {
        var (db, user, lesson, _) = await TestDbContextFactory.SeedBasicAsync();
        var service = new ProgressService(db);

        var result = await service.CompleteLessonAsync(user.Id, new CompleteLessonRequest(lesson.Id, true));

        Assert.NotNull(result);
        Assert.Equal(100, result!.XpEarned);
        var updated = await db.Users.Include(u => u.Progress).FirstAsync(u => u.Id == user.Id);
        Assert.Equal(600, updated.TotalXp);
        Assert.Single(updated.Progress);
    }

    [Fact]
    public async Task CompleteLessonAsync_AlreadyCompleted_ReturnsNull()
    {
        var (db, user, lesson, _) = await TestDbContextFactory.SeedBasicAsync();
        var service = new ProgressService(db);
        await service.CompleteLessonAsync(user.Id, new CompleteLessonRequest(lesson.Id, true));

        var second = await service.CompleteLessonAsync(user.Id, new CompleteLessonRequest(lesson.Id, true));

        Assert.Null(second);
    }

    [Fact]
    public async Task PurchaseHintAsync_Level1_Deducts50Xp()
    {
        var (db, user, lesson, _) = await TestDbContextFactory.SeedBasicAsync();
        var service = new ProgressService(db);

        var result = await service.PurchaseHintAsync(user.Id, new PurchaseHintRequest(lesson.Id, 1));

        Assert.NotNull(result);
        Assert.Equal(450, result!.TotalXp);
        Assert.Equal(1, result.HintLevel);
        Assert.Equal("Hint 1", result.HintText);
    }

    [Fact]
    public async Task PurchaseHintAsync_InsufficientXp_ReturnsNull()
    {
        var (db, user, lesson, _) = await TestDbContextFactory.SeedBasicAsync();
        user.TotalXp = 10;
        await db.SaveChangesAsync();
        var service = new ProgressService(db);

        var result = await service.PurchaseHintAsync(user.Id, new PurchaseHintRequest(lesson.Id, 2));

        Assert.Null(result);
    }

    [Fact]
    public async Task ApplyMoralChoiceAsync_BossLesson_GrantsXpAndReputation()
    {
        var (db, user, _, faction) = await TestDbContextFactory.SeedBasicAsync();
        var service = new ProgressService(db);

        var result = await service.ApplyMoralChoiceAsync(user.Id, new MoralChoiceRequest(faction.Id, 4));

        Assert.NotNull(result);
        Assert.Equal(1000, result!.TotalXp);
        var rep = await db.UserReputations.FirstOrDefaultAsync(r => r.UserId == user.Id && r.FactionId == faction.Id);
        Assert.NotNull(rep);
        Assert.Equal(50, rep!.Reputation);
    }

    [Fact]
    public async Task ApplyMoralChoiceAsync_NonBossLesson_ReturnsNull()
    {
        var (db, user, lesson, faction) = await TestDbContextFactory.SeedBasicAsync();
        var service = new ProgressService(db);

        var result = await service.ApplyMoralChoiceAsync(user.Id, new MoralChoiceRequest(faction.Id, lesson.Id));

        Assert.Null(result);
    }

    [Fact]
    public async Task ApplyMoralChoiceAsync_DuplicateChoice_ReturnsNull()
    {
        var (db, user, _, faction) = await TestDbContextFactory.SeedBasicAsync();
        var service = new ProgressService(db);
        await service.ApplyMoralChoiceAsync(user.Id, new MoralChoiceRequest(faction.Id, 4));

        var second = await service.ApplyMoralChoiceAsync(user.Id, new MoralChoiceRequest(faction.Id, 4));

        Assert.Null(second);
    }
}
