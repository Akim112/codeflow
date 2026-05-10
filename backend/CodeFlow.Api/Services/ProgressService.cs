using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Data;
using CodeFlow.Api.DTOs;
using CodeFlow.Api.Models;

namespace CodeFlow.Api.Services;

public class ProgressService : IProgressService
{
    private readonly AppDbContext _db;

    public ProgressService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserProgressSummaryDto?> GetProgressAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _db.Users
            .Include(u => u.Progress)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null) return null;

        var completed = user.Progress.OrderBy(p => p.CompletedAtUtc).ToList();
        var completedIds = completed.Select(p => p.LessonId).ToList();
        var totalXp = user.TotalXp;

        int cleanStreak = 0;
        for (var i = completed.Count - 1; i >= 0; i--)
        {
            if (!completed[i].WasCleanRun) break;
            cleanStreak++;
        }

        var fastBossKill = await _db.UserProgress
            .AnyAsync(p => p.UserId == userId && p.LessonId == 4 && p.WasCleanRun, ct);

        return new UserProgressSummaryDto(
            totalXp,
            completed.Count,
            completedIds,
            cleanStreak,
            fastBossKill
        );
    }

    public async Task<ProgressDto?> CompleteLessonAsync(Guid userId, CompleteLessonRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users
            .Include(u => u.Progress)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
        var lesson = await _db.Lessons.FindAsync(new object[] { request.LessonId }, ct);
        if (user == null || lesson == null) return null;

        if (user.Progress.Any(p => p.LessonId == request.LessonId))
            return null;

        var xpEarned = lesson.Xp;
        user.TotalXp += xpEarned;

        var progress = new UserProgress
        {
            UserId = userId,
            LessonId = request.LessonId,
            CompletedAtUtc = DateTime.UtcNow,
            XpEarned = xpEarned,
            WasCleanRun = request.WasCleanRun
        };
        user.Progress.Add(progress);

        _db.UserNotifications.Add(new UserNotification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = "lesson_complete",
            Title = "Урок завершён",
            Body = $"{lesson.Title}. +{xpEarned} XP",
            CreatedAtUtc = DateTime.UtcNow,
            IsRead = false
        });

        await AwardReputationAsync(userId, request.LessonId, request.WasCleanRun, ct);
        await RecalculateAndGrantAchievementsAsync(userId, ct);

        await _db.SaveChangesAsync(ct);

        return new ProgressDto(
            request.LessonId,
            progress.CompletedAtUtc,
            xpEarned,
            request.WasCleanRun
        );
    }

    public async Task<XpBalanceDto?> PurchaseHintAsync(Guid userId, PurchaseHintRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null) return null;
        if (request.Price <= 0) return null;
        if (user.TotalXp < request.Price) return null;

        user.TotalXp -= request.Price;
        await _db.SaveChangesAsync(ct);
        return new XpBalanceDto(user.TotalXp);
    }

    public async Task<XpBalanceDto?> ApplyMoralChoiceAsync(Guid userId, MoralChoiceRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null) return null;
        if (string.IsNullOrWhiteSpace(request.FactionId) || request.XpBonus < 0 || request.ReputationBonus < 0) return null;

        var factionExists = await _db.Factions.AnyAsync(f => f.Id == request.FactionId, ct);
        if (!factionExists) return null;

        user.TotalXp += request.XpBonus;
        await AddReputationAsync(userId, request.FactionId, request.ReputationBonus, ct);
        await RecalculateAndGrantAchievementsAsync(userId, ct);
        await _db.SaveChangesAsync(ct);
        return new XpBalanceDto(user.TotalXp);
    }

    public async Task<bool> ResetProgressAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _db.Users
            .Include(u => u.Progress)
            .Include(u => u.Achievements)
            .Include(u => u.Reputation)
            .Include(u => u.OwnedShopItems)
            .Include(u => u.Notifications)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null) return false;

        user.TotalXp = 0;
        _db.UserProgress.RemoveRange(user.Progress);
        _db.UserAchievements.RemoveRange(user.Achievements);
        _db.UserReputations.RemoveRange(user.Reputation);
        _db.UserNotifications.RemoveRange(user.Notifications);
        _db.UserShopItems.RemoveRange(user.OwnedShopItems.Where(i => i.ShopItemId != "classic"));
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private async Task AwardReputationAsync(Guid userId, int lessonId, bool wasCleanCode, CancellationToken ct)
    {
        if (lessonId >= 11 && lessonId <= 13)
            await AddReputationAsync(userId, "data_brokers", 10, ct);
        if (wasCleanCode)
            await AddReputationAsync(userId, "ai_ethicists", 5, ct);
        var bossLessons = new[] { 4, 7, 10, 13, 15 };
        if (bossLessons.Contains(lessonId))
        {
            await AddReputationAsync(userId, "crypto_rebels", 15, ct);
            await AddReputationAsync(userId, "ghost_protocol", 10, ct);
        }
    }

    private async Task AddReputationAsync(Guid userId, string factionId, int amount, CancellationToken ct)
    {
        var rep = await _db.UserReputations.FirstOrDefaultAsync(r => r.UserId == userId && r.FactionId == factionId, ct);
        if (rep == null)
        {
            rep = new UserReputation { UserId = userId, FactionId = factionId, Reputation = 0 };
            _db.UserReputations.Add(rep);
        }
        rep.Reputation += amount;
    }

    private async Task RecalculateAndGrantAchievementsAsync(Guid userId, CancellationToken ct)
    {
        var user = await _db.Users
            .Include(u => u.Progress)
            .Include(u => u.Achievements)
            .Include(u => u.Reputation)
            .Include(u => u.OwnedShopItems)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null) return;

        var completedIds = user.Progress.Select(p => p.LessonId).ToList();
        var totalXp = user.TotalXp;
        var themesOwned = user.OwnedShopItems.Count + 1;
        var maxFactionRep = user.Reputation.Any() ? user.Reputation.Max(r => r.Reputation) : 0;
        var cleanStreak = 0;
        foreach (var p in user.Progress.OrderByDescending(p => p.CompletedAtUtc))
        {
            if (!p.WasCleanRun) break;
            cleanStreak++;
        }
        var fastBossKill = user.Progress.Any(p => p.LessonId == 4 && p.WasCleanRun);

        var definitions = await _db.AchievementDefinitions.ToListAsync(ct);
        var unlockedIds = user.Achievements.Select(a => a.AchievementId).ToHashSet();

        foreach (var def in definitions)
        {
            if (unlockedIds.Contains(def.Id)) continue;
            var granted = def.Id switch
            {
                "first_hack" => completedIds.Count >= 1,
                "five_missions" => completedIds.Count >= 5,
                "ten_missions" => completedIds.Count >= 10,
                "all_missions" => completedIds.Count >= 15,
                "boss_slayer" => completedIds.Contains(4),
                "boss_slayer_2" => completedIds.Contains(7),
                "boss_slayer_3" => completedIds.Contains(10),
                "boss_slayer_4" => completedIds.Contains(13),
                "leviathan_slayer" => completedIds.Contains(15),
                "xp_500" => totalXp >= 500,
                "xp_1000" => totalXp >= 1000,
                "xp_3000" => totalXp >= 3000,
                "xp_5000" => totalXp >= 5000,
                "speed_demon" => fastBossKill,
                "clean_code" => cleanStreak >= 5,
                "night_owl" => false,
                "collector" => themesOwned >= 4,
                "faction_friend" => maxFactionRep >= 100,
                _ => false
            };
            if (granted)
            {
                _db.UserAchievements.Add(new UserAchievement
                {
                    UserId = userId,
                    AchievementId = def.Id,
                    UnlockedAtUtc = DateTime.UtcNow
                });
                _db.UserNotifications.Add(new UserNotification
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Type = "achievement",
                    Title = "Достижение разблокировано",
                    Body = $"{def.Icon} {def.Title}",
                    CreatedAtUtc = DateTime.UtcNow,
                    IsRead = false
                });
            }
        }
    }
}
