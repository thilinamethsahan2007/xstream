'use client';

import { useTrendingMovies, useTrendingAll, useMovieVideos } from '@/hooks/useMovies';
import { useTrendingTvShows } from '@/hooks/useTvShows';
import { useTvShowVideos } from '@/hooks/useTvShowDetails';
import { getImageUrl, isContentReleased } from '@/lib/utils';
import { Info, Play, Clock, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Movie } from 'tmdb-ts';
import { useModalStore } from '@/store/modalStore';
import { useRouter } from 'next/navigation';

interface HeroBannerProps {
    variant?: 'home' | 'movie' | 'tv';
}

export default function HeroBanner({ variant = 'home' }: HeroBannerProps) {
    const { data: movies } = useTrendingMovies();
    const { data: tvShows } = useTrendingTvShows();
    const { data: all } = useTrendingAll();

    const [content, setContent] = useState<any>(null);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const id = content?.id || 0;
    const isTV = !!content?.name;

    // Fetch videos based on selected content
    const { data: movieVideos } = useMovieVideos(isTV ? 0 : id);
    // Note: useTvShowVideos needs to be imported from useTvShowDetails, check imports
    const { data: tvVideos } = useTvShowVideos(isTV ? id : 0, isTV);

    const openModal = useModalStore((state) => state.openModal);
    const router = useRouter();

    useEffect(() => {
        let data: any[] = [];
        if (variant === 'movie') data = movies || [];
        else if (variant === 'tv') data = tvShows || [];
        else data = all || [];

        if (data && data.length > 0) {
            const randomContent = data[Math.floor(Math.random() * data.length)];
            setContent(randomContent);
            // Reset video state when content changes
            setTrailerKey(null);
            setIsVideoLoaded(false);
        }
    }, [movies, tvShows, all, variant]);

    // Handle video selection
    useEffect(() => {
        // Don't play videos on mobile
        if (typeof window !== 'undefined' && window.innerWidth < 768) return;

        const videos = isTV ? tvVideos : movieVideos;
        if (videos && videos.length > 0) {
            const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];
            if (trailer && trailer.site === 'YouTube') {
                setTrailerKey(trailer.key);
            }
        }
    }, [movieVideos, tvVideos, isTV, content]);

    if (!content) return <div className="h-[95vh] w-full bg-[#000000] animate-pulse" />;

    const title = content.title || content.name;
    const overview = content.overview;
    const backdropPath = content.backdrop_path;
    const releaseDate = content.release_date || content.first_air_date;

    return (
        <div className="relative h-[85vh] md:h-[95vh] w-full overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src={getImageUrl(backdropPath, 'original')}
                    alt={title}
                    className={`h-full w-full object-cover scale-105 transition-opacity duration-700 absolute inset-0 z-10 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}
                />
                {trailerKey && (
                    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                        <div className="relative w-full h-[300%] -top-[100%] pointer-events-none">
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&vq=medium`}
                                className="absolute top-0 left-0 w-full h-full scale-[1.35]"
                                allow="autoplay; encrypted-media"
                                title="Trailer"
                                onLoad={() => {
                                    setTimeout(() => setIsVideoLoaded(true), 1500);
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent" />
            </div>

            {/* Stronger bottom gradient for seamless blend */}
            <div className="absolute bottom-0 left-0 right-0 h-48 md:h-64 bg-gradient-to-t from-[#000000] via-[#000000]/80 to-transparent z-10" />

            <div className="relative z-20 flex h-full items-center px-6 md:px-16 lg:px-20 pt-20">
                <div className="max-w-xl lg:max-w-3xl space-y-6 md:space-y-8">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                        {title}
                    </h1>
                    <p className="text-lg md:text-xl lg:text-2xl line-clamp-3 text-gray-200 font-medium max-w-2xl drop-shadow-md">
                        {overview}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        {isContentReleased(releaseDate) ? (
                            <button
                                onClick={() => router.push(isTV ? `/watch/tv/${id}` : `/watch/movie/${id}`)}
                                className="flex items-center justify-center gap-3 px-8 md:px-10 py-3.5 md:py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95 text-lg shadow-xl"
                            >
                                <Play className="h-6 w-6 fill-black" />
                                Play Now
                            </button>
                        ) : (
                            <button
                                disabled
                                className="flex items-center justify-center gap-3 px-8 md:px-10 py-3.5 md:py-4 bg-white/10 text-white rounded-full font-bold cursor-not-allowed text-lg border border-white/10 backdrop-blur-md"
                            >
                                <Clock className="h-6 w-6" />
                                Coming Soon
                            </button>
                        )}
                        <button
                            onClick={() => content && openModal(content)}
                            className="flex items-center justify-center gap-3 px-8 md:px-10 py-3.5 md:py-4 bg-white/20 text-white rounded-full font-bold hover:bg-white/30 transition-all transform hover:scale-105 active:scale-95 text-lg backdrop-blur-md border border-white/10 shadow-lg"
                        >
                            <Info className="h-6 w-6" />
                            More Info
                        </button>
                        {trailerKey && isVideoLoaded && (
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="flex items-center justify-center gap-3 px-4 py-3.5 md:py-4 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all transform hover:scale-105 active:scale-95 backdrop-blur-md border border-white/10 shadow-lg"
                            >
                                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
