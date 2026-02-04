using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Models;

namespace CodeFlow.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<UserProgress> UserProgress => Set<UserProgress>();
    public DbSet<AchievementDefinition> AchievementDefinitions => Set<AchievementDefinition>();
    public DbSet<UserAchievement> UserAchievements => Set<UserAchievement>();
    public DbSet<Faction> Factions => Set<Faction>();
    public DbSet<UserReputation> UserReputations => Set<UserReputation>();
    public DbSet<ShopItem> ShopItems => Set<ShopItem>();
    public DbSet<UserShopItem> UserShopItems => Set<UserShopItem>();
    public DbSet<UserNotification> UserNotifications => Set<UserNotification>();
    public DbSet<SubmissionJob> SubmissionJobs => Set<SubmissionJob>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.HasIndex(x => x.TotalXp).IsDescending();
        });

        modelBuilder.Entity<Course>(e => e.HasKey(x => x.Id));
        modelBuilder.Entity<Lesson>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Course).WithMany(c => c.Lessons).HasForeignKey(x => x.CourseId);
        });

        modelBuilder.Entity<UserProgress>(e =>
        {
            e.HasKey(x => new { x.UserId, x.LessonId });
            e.HasOne(x => x.User).WithMany(u => u.Progress).HasForeignKey(x => x.UserId);
            e.HasOne(x => x.Lesson).WithMany().HasForeignKey(x => x.LessonId);
        });

        modelBuilder.Entity<AchievementDefinition>(e => e.HasKey(x => x.Id));
        modelBuilder.Entity<UserAchievement>(e =>
        {
            e.HasKey(x => new { x.UserId, x.AchievementId });
            e.HasOne(x => x.User).WithMany(u => u.Achievements).HasForeignKey(x => x.UserId);
            e.HasOne(x => x.Achievement).WithMany().HasForeignKey(x => x.AchievementId);
        });

        modelBuilder.Entity<Faction>(e => e.HasKey(x => x.Id));
        modelBuilder.Entity<UserReputation>(e =>
        {
            e.HasKey(x => new { x.UserId, x.FactionId });
            e.HasOne(x => x.User).WithMany(u => u.Reputation).HasForeignKey(x => x.UserId);
            e.HasOne(x => x.Faction).WithMany(f => f.UserReputations).HasForeignKey(x => x.FactionId);
        });

        modelBuilder.Entity<ShopItem>(e => e.HasKey(x => x.Id));
        modelBuilder.Entity<UserShopItem>(e =>
        {
            e.HasKey(x => new { x.UserId, x.ShopItemId });
            e.HasOne(x => x.User).WithMany(u => u.OwnedShopItems).HasForeignKey(x => x.UserId);
            e.HasOne(x => x.ShopItem).WithMany().HasForeignKey(x => x.ShopItemId);
        });

        modelBuilder.Entity<UserNotification>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.UserId);
            e.HasOne(x => x.User).WithMany(u => u.Notifications).HasForeignKey(x => x.UserId);
        });

        modelBuilder.Entity<SubmissionJob>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.UserId, x.CreatedAtUtc });
            e.HasOne(x => x.User).WithMany(u => u.SubmissionJobs).HasForeignKey(x => x.UserId);
            e.HasOne(x => x.Lesson).WithMany().HasForeignKey(x => x.LessonId);
        });
    }
}
