import { create } from 'zustand';

export interface TelegramMovie {
    id: number;
    title: string;
    channel_id: string;
    message_id: number;
    overview: string;
    size: number;
    mime_type: string;
    is_telegram: true;
}

interface TelegramModalState {
    isOpen: boolean;
    movie: TelegramMovie | null;
    openModal: (movie: TelegramMovie) => void;
    closeModal: () => void;
}

export const useTelegramModalStore = create<TelegramModalState>((set) => ({
    isOpen: false,
    movie: null,
    openModal: (movie) => set({ isOpen: true, movie }),
    closeModal: () => set({ isOpen: false, movie: null }),
}));
