import api from './client';

export interface ShopItem {
    id: string;
    name: string;
    color: string;
    bg: string;
    price: number;
}

export const shopApi = {
    /** Get all shop items */
    getItems: async (): Promise<ShopItem[]> => {
        return await api.get('/api/shop/items');
    },

    /** Purchase a shop item */
    purchase: async (shopItemId: string): Promise<ShopItem> => {
        return await api.post('/api/shop/purchase', { shopItemId });
    },

    /** Get items owned by current user */
    getMyItems: async (): Promise<ShopItem[]> => {
        return await api.get('/api/shop/me');
    },
};
