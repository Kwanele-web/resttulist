import { supabase } from './config.js';

export const LOCAL_OFFLINE_MENU = [
    {
        id: 'offline-burger',
        name: 'Classic Burger (Offline)',
        price: 49.99,
        description: 'Juicy beef patty with fresh lettuce and cheese (cached mode).'
    },
    {
        id: 'offline-fries',
        name: 'Crispy Fries (Offline)',
        price: 24.99,
        description: 'Golden salted potato fries.'
    }
];

export async function getMenuItems(isOnline) {
    if (!isOnline) {
        return { data: LOCAL_OFFLINE_MENU, isOfflineFallback: true };
    }

    try {
        const { data, error } = await supabase
            .from('menu')
            .select('id, created_at, name, price, description')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return { data: data || [], isOfflineFallback: false };
    } catch (error) {
        console.error('Supabase menu fetch failed; using offline data.', error);
        return { data: LOCAL_OFFLINE_MENU, isOfflineFallback: true, error };
    }
}
