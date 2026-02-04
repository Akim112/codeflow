using System.ComponentModel.DataAnnotations;

namespace CodeFlow.Api.DTOs;

public record ShopItemDto(string Id, string Name, string Color, string Bg, int Price);

public record PurchaseRequest([Required, MinLength(1)] string ShopItemId);
