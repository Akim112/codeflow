using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CodeFlow.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserMoralChoices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserMoralChoices",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LessonId = table.Column<int>(type: "integer", nullable: false),
                    FactionId = table.Column<string>(type: "text", nullable: false),
                    ChosenAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserMoralChoices", x => new { x.UserId, x.LessonId });
                    table.ForeignKey(
                        name: "FK_UserMoralChoices_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserMoralChoices_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserMoralChoices_LessonId",
                table: "UserMoralChoices",
                column: "LessonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserMoralChoices");
        }
    }
}
