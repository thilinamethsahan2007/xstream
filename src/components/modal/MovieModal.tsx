'use client';

import { useMovieDetails, useMovieVideos } from '@/hooks/useMovies';
import { useTvShowDetails, useTvShowSeason, useTvShowVideos } from '@/hooks/useTvShowDetails';
import { getImageUrl, isContentReleased } from '@/lib/utils';
import { useModalStore } from '@/store/modalStore';
import { X, Play, Clock, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MovieModal() {
    const { isOpen, movie, closeModal } = useModalStore();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);


    const isTV = (movie as any)?.media_type === 'tv' || !!(movie as any)?.name;
    const title = (movie as any)?.title || (movie as any)?.name;
    const releaseDate = (movie as any)?.release_date || (movie as any)?.first_air_date;

    const { data: movieDetails } = useMovieDetails(movie?.id || 0);
    const { data: tvDetails } = useTvShowDetails(movie?.id || 0, isTV);
    const { data: seasonData } = useTvShowSeason(movie?.id || 0, selectedSeason, isTV);
    const { data: movieVideos } = useMovieVideos(isTV ? 0 : (movie?.id || 0));
    const { data: tvVideos } = useTvShowVideos(isTV ? (movie?.id || 0) : 0, isTV);

    const details = isTV ? tvDetails : movieDetails;

    // Use season air date if available for TV shows, otherwise fallback to main release date
    const displayDate = (isTV && seasonData?.air_date) ? seasonData.air_date : releaseDate;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const videos = isTV ? tvVideos : movieVideos;
        if (videos && videos.length > 0) {
            const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];
            if (trailer && trailer.site === 'YouTube') {
                setTrailerKey(trailer.key);
            }
        }
    }, [movieVideos, tvVideos, isTV]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset state when closed
            setTrailerKey(null);
            setIsVideoLoaded(false);
            setIsMuted(true);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isMounted || !movie) return null;

    const handlePlay = (season?: number, episode?: number) => {
        closeModal();
        if (isTV && season && episode) {
            router.push(`/watch/tv/${movie?.id}?season=${season}&episode=${episode}`);
        } else if (isTV) {
            router.push(`/watch/tv/${movie?.id}?season=1&episode=1`);
        } else {
            router.push(`/watch/movie/${movie?.id}`);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
                        onClick={closeModal}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 sm:inset-4 md:inset-8 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-[100] lg:h-[85vh] w-full lg:max-w-5xl overflow-y-auto rounded-none sm:rounded-2xl bg-[#1c1c1e] text-white shadow-2xl scrollbar-hide border border-white/10"
                    >
                        <button
                            onClick={closeModal}
                            className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 hover:bg-black/70 backdrop-blur-sm transition-colors"
                        >
                            <X className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>

                        <div className="relative h-[300px] sm:h-[400px] md:h-[450px] w-full overflow-hidden">
                            <img
                                src={getImageUrl(movie.backdrop_path || movie.poster_path, 'original')}
                                alt={title}
                                className={`h-full w-full object-cover transition-opacity duration-700 absolute inset-0 z-10 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}
                            />
                            {trailerKey && (
                                <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                                    <div className="relative w-full h-[300%] -top-[100%] pointer-events-none">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&vq=medium`}
                                            className="absolute top-0 left-0 w-full h-full"
                                            allow="autoplay; encrypted-media"
                                            title="Trailer"
                                            onLoad={() => {
                                                // Small delay to ensure player is actually rendering frame
                                                setTimeout(() => setIsVideoLoaded(true), 1500);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-[#1c1c1e]/20 to-transparent z-10" />

                            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 right-6 z-20">
                                <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-shadow-lg">{title}</h2>
                                <div className="flex items-center gap-3">
                                    {!isTV && (
                                        isContentReleased(releaseDate) ? (
                                            <button
                                                onClick={() => handlePlay()}
                                                className="flex items-center gap-2 rounded-full bg-white px-8 py-3 text-base font-bold text-black hover:bg-gray-200 transition-transform active:scale-95 shadow-lg"
                                            >
                                                <Play className="h-5 w-5 fill-black" /> Play
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-8 py-3 text-base font-bold text-white cursor-not-allowed border border-white/10"
                                            >
                                                <Clock className="h-5 w-5" /> Coming Soon
                                            </button>
                                        )
                                    )}

                                    {trailerKey && isVideoLoaded && (
                                        <button
                                            onClick={() => setIsMuted(!isMuted)}
                                            className="flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md p-3 text-white hover:bg-black/70 transition-colors border border-white/10"
                                        >
                                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                        </button>
                                    )}

                                </div>
                            </div>
                        </div>

                        <div className="px-6 sm:px-10 py-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-8">
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                                        <span className="text-green-400 font-bold">98% Match</span>
                                        <span className="text-gray-400">{displayDate?.split('-')[0]}</span>
                                        <span className="border border-white/20 px-1.5 py-0.5 rounded text-xs text-gray-300">HD</span>
                                        {isTV && <span className="text-gray-400">TV Show</span>}
                                    </div>
                                    <p className="text-base leading-relaxed text-gray-200 font-light">{movie.overview}</p>
                                </div>

                                <div className="lg:col-span-1 space-y-3 text-sm text-gray-400">
                                    <div>
                                        <span className="text-gray-500">Genres: </span>
                                        <span className="text-gray-300">{details?.genres?.map(g => g.name).join(', ') || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Language: </span>
                                        <span className="text-gray-300">{movie.original_language?.toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Rating: </span>
                                        <span className="text-gray-300">{movie.vote_average?.toFixed(1)}</span>
                                    </div>
                                    {isTV && tvDetails?.number_of_seasons && (
                                        <div>
                                            <span className="text-gray-500">Seasons: </span>
                                            <span className="text-gray-300">{tvDetails.number_of_seasons}</span>
                                        </div>
                                    )}
                                    {/* Cast Section */}
                                    <div>
                                        <span className="text-gray-500">Cast: </span>
                                        <span className="text-gray-300">
                                            {details?.credits?.cast?.slice(0, 5).map(person => person.name).join(', ') || 'N/A'}
                                        </span>
                                        {details?.credits?.cast && details.credits.cast.length > 5 && (
                                            <span className="text-gray-500 italic">, more</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isTV && tvDetails?.number_of_seasons && (
                                <div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                                        <h3 className="text-2xl font-bold tracking-tight">Episodes</h3>
                                        <div className="relative">
                                            <select
                                                value={selectedSeason}
                                                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                                className="appearance-none bg-[#2c2c2e] text-white px-4 py-2 pr-8 rounded-lg border border-white/10 cursor-pointer hover:bg-[#3a3a3c] text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {Array.from({ length: tvDetails.number_of_seasons }, (_, i) => i + 1).map(season => (
                                                    <option key={season} value={season}>Season {season}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {seasonData?.episodes && seasonData.episodes.length > 0 ? (
                                        <div className="space-y-2">
                                            {seasonData.episodes.map((episode: any) => {
                                                const isEpisodeReleased = isContentReleased(episode.air_date);
                                                return (
                                                    <div
                                                        key={episode.id}
                                                        onClick={() => isEpisodeReleased && handlePlay(selectedSeason, episode.episode_number)}
                                                        className={`flex gap-4 p-4 rounded-xl transition-all group ${isEpisodeReleased
                                                            ? 'hover:bg-[#2c2c2e] cursor-pointer'
                                                            : 'opacity-50 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        <div className={`text-xl font-bold w-8 flex-shrink-0 flex items-center justify-center ${isEpisodeReleased
                                                            ? 'text-gray-500 group-hover:text-white'
                                                            : 'text-gray-700'
                                                            }`}>
                                                            {episode.episode_number}
                                                        </div>
                                                        <div className="relative flex-shrink-0">
                                                            {episode.still_path ? (
                                                                <img
                                                                    src={getImageUrl(episode.still_path, 'w500')}
                                                                    alt={episode.name}
                                                                    className="w-32 h-20 object-cover rounded-lg shadow-md"
                                                                />
                                                            ) : (
                                                                <div className="w-32 h-20 bg-[#2c2c2e] rounded-lg flex items-center justify-center">
                                                                    <span className="text-xs text-gray-500">No Image</span>
                                                                </div>
                                                            )}
                                                            {isEpisodeReleased && (
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                                                                    <Play className="h-8 w-8 text-white fill-white" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0 py-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className={`text-base font-semibold truncate ${isEpisodeReleased
                                                                    ? 'text-white'
                                                                    : 'text-gray-500'
                                                                    }`}>
                                                                    {episode.name}
                                                                </h4>
                                                                <span className="text-sm text-gray-400 ml-4 flex-shrink-0">
                                                                    {episode.runtime ? `${episode.runtime}m` : ''}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                                                {episode.overview || 'No description available.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 text-center py-12 text-base">
                                            {seasonData ? 'No episodes available for this season.' : 'Loading episodes...'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
