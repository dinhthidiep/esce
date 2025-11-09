using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ESCE_SYSTEM.Migrations
{
    public partial class AddAccountServiceComboRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SERVICECOMBO_Accounts_HOST_ID",
                table: "SERVICECOMBO");

            migrationBuilder.DropForeignKey(
                name: "FK_SERVICECOMBO_Accounts_HostId1",
                table: "SERVICECOMBO");

            migrationBuilder.DropIndex(
                name: "IX_SERVICECOMBO_HostId1",
                table: "SERVICECOMBO");

            migrationBuilder.DropColumn(
                name: "HostId1",
                table: "SERVICECOMBO");

            migrationBuilder.AddForeignKey(
                name: "FK_SERVICECOMBO_Accounts_HOST_ID",
                table: "SERVICECOMBO",
                column: "HOST_ID",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SERVICECOMBO_Accounts_HOST_ID",
                table: "SERVICECOMBO");

            migrationBuilder.AddColumn<int>(
                name: "HostId1",
                table: "SERVICECOMBO",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_SERVICECOMBO_HostId1",
                table: "SERVICECOMBO",
                column: "HostId1");

            migrationBuilder.AddForeignKey(
                name: "FK_SERVICECOMBO_Accounts_HOST_ID",
                table: "SERVICECOMBO",
                column: "HOST_ID",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SERVICECOMBO_Accounts_HostId1",
                table: "SERVICECOMBO",
                column: "HostId1",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
