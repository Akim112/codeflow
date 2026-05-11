using CodeFlow.Api.DTOs;
using CodeFlow.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace CodeFlow.Api.Tests;

public class AuthServiceTests
{
    private static IConfiguration CreateConfig() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "CodeFlow-Test-SecretKey-32CharsMin!!",
                ["Jwt:Issuer"] = "CodeFlow.Test",
                ["Jwt:ExpirationMinutes"] = "60",
                ["App:BaseUrl"] = "http://localhost:5173"
            })
            .Build();

    [Fact]
    public async Task RegisterAsync_ValidUser_ReturnsToken()
    {
        var db = TestDbContextFactory.Create();
        var service = new AuthService(db, CreateConfig(), new EmailStubService(NullLogger<EmailStubService>.Instance));

        var result = await service.RegisterAsync(new RegisterRequest("new@codeflow.io", "secret12", "Agent"));

        Assert.NotNull(result);
        Assert.False(string.IsNullOrWhiteSpace(result!.AccessToken));
        Assert.Equal("new@codeflow.io", result.User.Email);
        Assert.True(await db.Users.AnyAsync(u => u.Email == "new@codeflow.io"));
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ReturnsNull()
    {
        var (db, user, _, _) = await TestDbContextFactory.SeedBasicAsync();
        var service = new AuthService(db, CreateConfig(), new EmailStubService(NullLogger<EmailStubService>.Instance));

        var result = await service.RegisterAsync(new RegisterRequest(user.Email, "secret12", "Dup"));

        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsToken()
    {
        var (db, user, _, _) = await TestDbContextFactory.SeedBasicAsync();
        var service = new AuthService(db, CreateConfig(), new EmailStubService(NullLogger<EmailStubService>.Instance));

        var result = await service.LoginAsync(new LoginRequest(user.Email, "password123"));

        Assert.NotNull(result);
        Assert.False(string.IsNullOrWhiteSpace(result!.AccessToken));
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ReturnsNull()
    {
        var (db, user, _, _) = await TestDbContextFactory.SeedBasicAsync();
        var service = new AuthService(db, CreateConfig(), new EmailStubService(NullLogger<EmailStubService>.Instance));

        var result = await service.LoginAsync(new LoginRequest(user.Email, "wrong"));

        Assert.Null(result);
    }
}
