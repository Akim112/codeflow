import api from './client';

export interface Faction {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    bonus: string;
    requiredRep: number;
}

export interface UserReputation {
    factionId: string;
    reputation: number;
}

export const factionsApi = {
    getAll: async (): Promise<Faction[]> => {
        return await api.get('/api/factions');
    },

    getMyReputation: async (): Promise<UserReputation[]> => {
        return await api.get('/api/factions/me');
    },
};
