'use client';

import { getImageUrl, isContentReleased } from '@/lib/utils';
import { useModalStore } from '@/store/modalStore';

import { Movie } from 'tmdb-ts';
import { motion } from 'framer-motion';
import { Star, Play, Clock, ChevronDown, Send } from 'lucide-react';
import { useState } from 'react';
import Badge from './Badge';

interface MovieCardProps {
    movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
    const openModal = useModalStore((state) => state.openModal);

    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Handle both movies and TV shows
    const isTV = !!(movie as any).name;

    const title = isTV ? (movie as any).name : movie.title;
    const releaseDate = isTV ? (movie as any).first_air_date : movie.release_date;

    const posterUrl = getImageUrl(movie.poster_path || movie.backdrop_path, 'w500');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{
                y: -12,
                scale: 1.05,
                transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
            }}
            className="relative aspect-[2/3] cursor-pointer group rounded-xl overflow-hidden shadow-2xl shadow-black/50 hover:shadow-white/10 transition-shadow duration-300"
            onClick={() => openModal(movie)}
            onKeyDown={(e) => e.key === 'Enter' && openModal(movie)}
            tabIndex={0}
            role="button"
            aria-label={`View details for ${title}`}
        >
            {/* Movie Poster */}
            {!imageError ? (
                <img
                    src={posterUrl}
                    alt={title}
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="h-full w-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/5">
                    <span className="text-white/40 text-xs text-center px-4 uppercase tracking-widest">{title}</span>
                </div>
            )}

            {/* Gradient Overlay - Always visible on hover */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" 
            />

            {/* Content - Shows on hover with delay */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(2px)' }}
                animate={{ 
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1 : 0.95,
                    filter: isHovered ? 'blur(0px)' : 'blur(2px)'
                }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 flex flex-col justify-end p-4"
            >
                <>
                    {/* TMDB hover content */}
                    <div className="flex items-center gap-2 mb-3">
                        {isContentReleased(releaseDate) ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transform hover:scale-105 active:scale-[0.97] shadow-lg"
                                style={{ transition: 'transform 160ms var(--ease-out), background-color 200ms var(--ease-out)' }}
                            >
                                <Play className="h-4 w-4 fill-black text-black ml-0.5" />
                            </button>
                        ) : (
                            <button className="bg-white/10 backdrop-blur-md rounded-full p-2.5 cursor-not-allowed">
                                <Clock className="h-4 w-4 text-white" />
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal(movie);
                            }}
                            className="ml-auto bg-white/10 backdrop-blur-md rounded-full p-2.5 hover:bg-white/20 transform hover:scale-105 active:scale-[0.97]"
                            style={{ transition: 'transform 160ms var(--ease-out), background-color 200ms var(--ease-out)' }}
                        >
                            <ChevronDown className="h-4 w-4 text-white" />
                        </button>
                    </div>

                    <h3 className="text-white font-bold text-lg line-clamp-1 mb-2 tracking-tight drop-shadow-md">
                        {title}
                    </h3>

                    <div className="flex items-center gap-3 text-[11px] text-white/70 mb-3 font-medium uppercase tracking-wider">
                        {movie.vote_average && movie.vote_average > 0 && (
                            <span className="text-white">{Math.round(movie.vote_average * 10)}% Match</span>
                        )}
                        {releaseDate && (
                            <span>{releaseDate.split('-')[0]}</span>
                        )}
                        <span className="border border-white/20 px-1.5 py-0.5 rounded text-[9px] text-white/50">HD</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {releaseDate && new Date(releaseDate).getFullYear() === new Date().getFullYear() && (
                            <Badge variant="blue">New</Badge>
                        )}
                        {isTV && (
                            <Badge variant="blue">Season</Badge>
                        )}
                        {!isContentReleased(releaseDate) && (
                            <Badge variant="orange">Coming Soon</Badge>
                        )}
                    </div>
                </>
            </motion.div>
        </motion.div>
    );
}
