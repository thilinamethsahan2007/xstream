'use client';

import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { useWatchHistory, WatchHistoryItem } from '@/hooks/useWatchHistory';
import { getImageUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ContinueWatchingRowProps {
    title?: string;
}

export default function ContinueWatchingRow({ title = "Continue Watching" }: ContinueWatchingRowProps) {
    const { getRecentHistory, removeFromHistory } = useWatchHistory();
    const history = getRecentHistory(10);
    const router = useRouter();

    if (history.length === 0) {
        return null; // Don't show if no history
    }

    const handlePlay = (item: WatchHistoryItem) => {
        const url = item.type === 'movie'
            ? `/watch/movie/${item.id}`
            : `/watch/tv/${item.id}?season=${item.season}&episode=${item.episode}`;
        router.push(url);
    };

    const handleRemove = (e: React.MouseEvent, item: WatchHistoryItem) => {
        e.stopPropagation();
        removeFromHistory(item.id, item.type);
    };


    return (
        <div className="space-y-4 px-4 md:px-8">
            <h2 className="text-xl md:text-2xl font-bold text-white">
                {title}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {history.map((item) => (
                    <motion.div
                        key={`${item.type}-${item.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{
                            y: -12,
                            scale: 1.05,
                            transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
                        }}
                        className="relative aspect-[2/3] cursor-pointer group rounded-xl overflow-hidden shadow-2xl shadow-black/50 hover:shadow-white/10 transition-shadow duration-300"
                        onClick={() => handlePlay(item)}
                    >
                        {/* Poster */}
                        <img
                            src={getImageUrl(item.poster, 'w500')}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        <div 
                            className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 hidden md:block"
                            style={{ transition: 'opacity 200ms var(--ease-out)' }} 
                        />

                        {/* Hover Overlay */}
                        <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-3 hidden md:flex"
                            style={{ transition: 'opacity 200ms var(--ease-out)' }}
                        >
                            {/* Play Button */}
                            <button 
                                className="bg-white/90 backdrop-blur-sm rounded-full p-4 mb-2 hover:bg-white transform hover:scale-105 active:scale-[0.97] shadow-lg"
                                style={{ transition: 'transform 160ms var(--ease-out), background-color 200ms var(--ease-out)' }}
                            >
                                <Play className="h-6 w-6 fill-black text-black ml-1" />
                            </button>

                            {/* Title */}
                            <h3 className="text-white font-bold text-sm text-center line-clamp-2 mb-1 drop-shadow-md">
                                {item.title}
                            </h3>

                            {/* Episode Info for TV */}
                            {item.type === 'tv' && item.season && item.episode && (
                                <p className="text-white/70 text-xs font-medium tracking-wider uppercase">
                                    S{item.season} E{item.episode}
                                </p>
                            )}


                            {/* Remove Button */}
                            <button
                                onClick={(e) => handleRemove(e, item)}
                                className="absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-full p-2 hover:bg-white/20 transform hover:scale-110 active:scale-[0.97] border border-white/10"
                                style={{ transition: 'transform 160ms var(--ease-out), background-color 200ms var(--ease-out)' }}
                                aria-label="Remove from Continue Watching"
                            >
                                <X className="h-4 w-4 text-white" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
