import { useQuery } from '@tanstack/react-query';
import { tmdb } from '@/lib/tmdb';

export const useTvShowDetails = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['tvShow', id],
        queryFn: async () => {
            if (!id) return null;
            // Fetch details with credits, similar, and videos
            const res = await tmdb.tvShows.details(id, ['credits', 'similar', 'videos']);
            return res;
        },
        enabled: enabled && !!id,
    });
};

export const useTvShowSeason = (id: number, seasonNumber: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['tvSeason', id, seasonNumber],
        queryFn: async () => {
            if (!id || !seasonNumber) return null;
            // Use tmdb.tvShows.season() like Zynema does
            const res = await tmdb.tvShows.season(id, seasonNumber);
            return res;
        },
        enabled: enabled && !!id && !!seasonNumber,
    });
};

export const useTvShowVideos = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['tv-videos', id],
        queryFn: async () => {
            if (!id) return null;
            const res = await tmdb.tvShows.videos(id);
            return res.results;
        },
        enabled: enabled && !!id,
    });
};
