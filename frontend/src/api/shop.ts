import api from './client';

export interface ShopItem {
    id: string;
    name: string;
    color: string;
    bg: string;
    price: number;
}

export const shopApi = {
    getItems: async (): Promise<ShopItem[]> => {
        return await api.get('/api/shop/items');
    },

    purchase: async (shopItemId: string): Promise<ShopItem> => {
        return await api.post('/api/shop/purchase', { shopItemId });
    },

    getMyItems: async (): Promise<ShopItem[]> => {
        return await api.get('/api/shop/me');
    },
};
