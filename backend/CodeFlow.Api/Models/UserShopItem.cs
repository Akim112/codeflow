namespace CodeFlow.Api.Models;

public class UserShopItem
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string ShopItemId { get; set; } = string.Empty;
    public ShopItem ShopItem { get; set; } = null!;
    public DateTime PurchasedAtUtc { get; set; }
}
