'use client';

import { useState, useEffect, useRef } from 'react';
import { useWatchHistory } from '@/hooks/useWatchHistory';

interface CustomPlayerProps {
    tmdbId: string;
    season?: string;
    episode?: string;
    fallbackUrl: string;
    title?: string;
    poster?: string;
    type?: 'movie' | 'tv';
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
    episodeTitle,
}: CustomPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [initialTime, setInitialTime] = useState(0);

    useEffect(() => {
        setIsPlaying(true);
        return () => setIsPlaying(false);
    }, []);

    const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { addToHistory, getProgress } = useWatchHistory();

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
                addToHistory({
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
                });
            }, 10000);
        }

        return () => {
            if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
        };
    }, [
        isPlaying,
        tmdbId,
        type,
        title,
        poster,
        season,
        episode,
        episodeTitle,
        addToHistory,
    ]);

    useEffect(() => {
        const originalWindowOpen = window.open;
        window.open = () => null;
        return () => {
            window.open = originalWindowOpen;
        };
    }, []);

    return (
        <div className="relative h-full w-full bg-black">
            <iframe
                src={fallbackUrl}
                className="h-full w-full border-none"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="no-referrer"
                title="Video Player"
            />
        </div>
    );
}
