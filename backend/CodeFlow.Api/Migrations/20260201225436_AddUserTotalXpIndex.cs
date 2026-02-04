using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CodeFlow.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserTotalXpIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Users_TotalXp",
                table: "Users",
                column: "TotalXp",
                descending: new bool[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_TotalXp",
                table: "Users");
        }
    }
}
