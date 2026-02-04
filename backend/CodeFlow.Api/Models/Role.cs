namespace CodeFlow.Api.Models;

/// <summary>
/// Роли: Пользователь, Преподаватель, Администратор.
/// </summary>
public static class Role
{
    public const string User = "User";
    public const string Teacher = "Teacher";
    public const string Admin = "Admin";

    public static readonly string[] All = { User, Teacher, Admin };
}
