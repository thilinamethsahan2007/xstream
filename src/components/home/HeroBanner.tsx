'use client';

import { useTrendingMovies, useTrendingAll } from '@/hooks/useMovies';
import { useTrendingTvShows } from '@/hooks/useTvShows';
import { getImageUrl, isContentReleased } from '@/lib/utils';
import { Info, Play, Clock } from 'lucide-react';
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
        }
    }, [movies, tvShows, all, variant]);

    if (!content) return <div className="h-[95vh] w-full bg-[#000000] animate-pulse" />;

    const title = content.title || content.name;
    const overview = content.overview;
    const backdropPath = content.backdrop_path;
    const releaseDate = content.release_date || content.first_air_date;
    const id = content.id;
    const isTV = !!content.name;

    return (
        <div className="relative h-[85vh] md:h-[95vh] w-full overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src={getImageUrl(backdropPath, 'original')}
                    alt={title}
                    className="h-full w-full object-cover scale-105"
                />
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
                    </div>
                </div>
            </div>
        </div>
    );
}
