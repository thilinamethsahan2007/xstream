'use client';

import { useState, useEffect, useRef } from 'react';
import { useWatchHistory } from '@/hooks/useWatchHistory';

interface CustomPlayerProps {
    tmdbId: string;
    season?: string;
    episode?: string;
    fallbackUrl: string;
    // For watch history
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
    episodeTitle
}: CustomPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    // We'll treat the iframe as "playing" for history purposes
    useEffect(() => {
        setIsPlaying(true);
        return () => setIsPlaying(false);
    }, []);

    const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const { addToHistory } = useWatchHistory();



    // Save progress periodically (iframe mode)
    useEffect(() => {
        if (isPlaying && type && title && poster) {
            console.log('✅ Starting watch history tracking for:', title);
            saveIntervalRef.current = setInterval(() => {
                const historyItem = {
                    id: parseInt(tmdbId),
                    type,
                    title,
                    poster,
                    timestamp: Date.now(),
                    progress: 0, // Can't track exact progress in iframe
                    duration: 0,
                    season: season ? parseInt(season) : undefined,
                    episode: episode ? parseInt(episode) : undefined,
                    episodeTitle,
                };
                console.log('💾 Saving progress:', historyItem);
                addToHistory(historyItem);
            }, 10000); // Save every 10 seconds
        }

        return () => {
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current);
                console.log('🛑 Stopped watch history tracking');
            }
        };
    }, [isPlaying, tmdbId, type, title, poster, season, episode, episodeTitle, addToHistory]);



    // Popup blocker - blocks popups from iframe
    useEffect(() => {
        // Override window.open to block popups
        const originalWindowOpen = window.open;
        window.open = function (...args) {
            console.log('Blocked popup attempt:', args);
            return null;
        };

        // Block popup events
        const blockPopup = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Blocked popup event');
        };

        window.addEventListener('open', blockPopup);

        return () => {
            window.open = originalWindowOpen;
            window.removeEventListener('open', blockPopup);
        };
    }, []);

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
