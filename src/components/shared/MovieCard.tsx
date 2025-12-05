'use client';

import { getImageUrl, isContentReleased } from '@/lib/utils';
import { useModalStore } from '@/store/modalStore';
import { Movie } from 'tmdb-ts';
import { motion } from 'framer-motion';
import { Star, Play, Clock, ChevronDown } from 'lucide-react';
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
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
            }}
            className="relative aspect-[2/3] cursor-pointer group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-shadow duration-300"
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
                <div className="h-full w-full bg-[#1c1c1e] flex items-center justify-center">
                    <span className="text-gray-500 text-xs text-center px-2">{title}</span>
                </div>
            )}

            {/* Gradient Overlay - Always visible on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content - Shows on hover with delay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex flex-col justify-end p-4"
            >
                {/* Action Buttons */}
                <div className="flex items-center gap-2 mb-3">
                    {isContentReleased(releaseDate) ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition transform hover:scale-105 active:scale-95 shadow-lg"
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
                        className="ml-auto bg-white/10 backdrop-blur-md rounded-full p-2.5 hover:bg-white/20 transition transform hover:scale-105 active:scale-95"
                    >
                        <ChevronDown className="h-4 w-4 text-white" />
                    </button>
                </div>

                {/* Title and Info */}
                <h3 className="text-label-primary font-semibold text-base line-clamp-1 mb-1 tracking-tight">
                    {title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-label-secondary mb-2 font-medium">
                    {movie.vote_average && movie.vote_average > 0 && (
                        <span className="text-system-green font-semibold">{Math.round(movie.vote_average * 10)}% Match</span>
                    )}
                    {releaseDate && (
                        <span>{releaseDate.split('-')[0]}</span>
                    )}
                    <span className="border border-label-secondary/30 px-1.5 py-0.5 rounded text-[10px] uppercase text-label-secondary">HD</span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                    {/* Recently Added Badge */}
                    {releaseDate && new Date(releaseDate).getFullYear() === new Date().getFullYear() && (
                        <Badge variant="blue">New</Badge>
                    )}

                    {/* New Season Badge */}
                    {isTV && (
                        <Badge variant="blue">Season</Badge>
                    )}

                    {!isContentReleased(releaseDate) && (
                        <Badge variant="orange">Coming Soon</Badge>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
