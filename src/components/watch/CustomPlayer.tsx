'use client';

import { useState, useEffect, useRef } from 'react';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import TelegramPlayer from './TelegramPlayer';

interface CustomPlayerProps {
    tmdbId: string;
    season?: string;
    episode?: string;
    fallbackUrl: string;
    title?: string;
    poster?: string;
    type?: 'movie' | 'tv' | 'telegram';
    episodeTitle?: string;
}

export default function CustomPlayer({
    tmdbId,
    season,
    episode,
    fallbackUrl,
    title,
    poster,
    type,
    episodeTitle
}: CustomPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        setIsPlaying(true);
        return () => setIsPlaying(false);
    }, []);

    const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { addToHistory } = useWatchHistory();

    useEffect(() => {
        if (isPlaying && (type === 'movie' || type === 'tv') && title && poster) {
            saveIntervalRef.current = setInterval(() => {
                const historyItem = {
                    id: parseInt(tmdbId),
                    type,
                    title,
                    poster,
                    timestamp: Date.now(),
                    progress: 0, 
                    duration: 0,
                    season: season ? parseInt(season) : undefined,
                    episode: episode ? parseInt(episode) : undefined,
                    episodeTitle,
                };
                addToHistory(historyItem);
            }, 10000); 
        }

        return () => {
            if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
        };
    }, [isPlaying, tmdbId, type, title, poster, season, episode, episodeTitle, addToHistory]);

    // Only block popups for TMDB iframes, not native Telegram video
    useEffect(() => {
        if (type === 'telegram') return; 
        const originalWindowOpen = window.open;
        window.open = function (...args) { return null; };
        const blockPopup = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
        window.addEventListener('open', blockPopup);
        return () => {
            window.open = originalWindowOpen;
            window.removeEventListener('open', blockPopup);
        };
    }, [type]);

    // RENDER CUSTOM PLAYER FOR TELEGRAM STREAMS
    if (type === 'telegram') {
        return <TelegramPlayer src={fallbackUrl} title={title} />;
    }

    // RENDER IFRAME FOR TMDB
    return (
        <div className="relative w-full h-full bg-black">
            <iframe
                src={fallbackUrl}
                className="h-full w-full border-none"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title="Video Player"
            />
        </div>
    );
}
