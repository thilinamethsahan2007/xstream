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
    const [initialTime, setInitialTime] = useState(0);
    const progressRef = useRef<{time: number, duration: number}>({time: 0, duration: 0});

    useEffect(() => {
        setIsPlaying(true);
        return () => setIsPlaying(false);
    }, []);

    const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { addToHistory, getProgress } = useWatchHistory();

    // Fetch initial time from history on mount
    useEffect(() => {
        if (tmdbId && type) {
            const hist = getProgress(parseInt(tmdbId), type);
            if (hist && hist.progress > 0) {
                setInitialTime(hist.progress);
            }
        }
    }, [tmdbId, type]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (isPlaying && type && title && poster) {
            saveIntervalRef.current = setInterval(() => {
                // For Telegram player we use the ref. For TMDB iframes we can't get progress so it stays 0.
                const currentProgress = type === 'telegram' ? progressRef.current.time : 0;
                const currentDuration = type === 'telegram' ? progressRef.current.duration : 0;
                
                const historyItem = {
                    id: parseInt(tmdbId),
                    type,
                    title,
                    poster,
                    timestamp: Date.now(),
                    progress: currentProgress, 
                    duration: currentDuration,
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
        return <TelegramPlayer 
            src={fallbackUrl} 
            title={title} 
            initialTime={initialTime}
            onProgress={(time, duration) => {
                progressRef.current = { time, duration };
            }}
        />;
    }

    // RENDER IFRAME FOR TMDB AS FALLBACK
    return (
        <div className="relative w-full h-full bg-black">
            <iframe
                src={fallbackUrl}
                className="h-full w-full border-none"
                allowFullScreen
                sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-presentation"
                allow="autoplay; encrypted-media"
                title="Video Player"
            />
        </div>
    );
}
