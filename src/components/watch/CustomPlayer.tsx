'use client';

import { useState, useEffect } from 'react';
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
    const [mounted, setMounted] = useState(false);
    const [playerUrl, setPlayerUrl] = useState('');
    const { addToHistory, getProgress } = useWatchHistory();

    // Prepare URL with startAt and autonext
    useEffect(() => {
        let url = fallbackUrl;
        const params = new URLSearchParams();
        
        if (type === 'tv') {
            params.append('autonext', '1');
        }
        
        if (tmdbId && type) {
            const hist = getProgress(parseInt(tmdbId), type);
            if (hist && Math.floor(hist.progress) > 0) {
                params.append('startAt', Math.floor(hist.progress).toString());
            }
        }
        
        const queryString = params.toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
        
        setPlayerUrl(url);
        setMounted(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fallbackUrl, tmdbId, type]);

    // Handle VidSrc player events
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PLAYER_EVENT') {
                const { player_status, player_progress, player_duration } = event.data.data;
                
                if (
                    (player_status === 'playing' || player_status === 'paused' || player_status === 'completed') && 
                    type && title && poster && tmdbId
                ) {
                    addToHistory({
                        id: parseInt(tmdbId),
                        type,
                        title,
                        poster,
                        timestamp: Date.now(),
                        progress: player_progress || 0,
                        duration: player_duration || 0,
                        season: season ? parseInt(season) : undefined,
                        episode: episode ? parseInt(episode) : undefined,
                        episodeTitle,
                    });
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [addToHistory, tmdbId, type, title, poster, season, episode, episodeTitle]);

    // Block popups just in case
    useEffect(() => {
        const originalWindowOpen = window.open;
        window.open = () => null;
        return () => {
            window.open = originalWindowOpen;
        };
    }, []);

    if (!mounted) {
        return <div className="h-full w-full bg-black animate-pulse" />;
    }

    return (
        <div className="relative h-full w-full bg-black">
            <iframe
                src={playerUrl}
                className="h-full w-full border-none"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="no-referrer"
                title="Video Player"
            />
        </div>
    );
}
