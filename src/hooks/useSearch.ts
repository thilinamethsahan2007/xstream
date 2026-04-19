import { useQuery } from '@tanstack/react-query';
import { tmdb } from '@/lib/tmdb';

export const useSearchMovies = (query: string, isTelegramMode: boolean = false) => {
    return useQuery({
        queryKey: ['search', query, isTelegramMode],
        queryFn: async () => {
            if (!query) return [];

            // 1. TELEGRAM SEARCH
            if (isTelegramMode) {
                try {
                    const res = await fetch(`/api/telegram/search?query=${encodeURIComponent(query)}`);
                    if (!res.ok) throw new Error('Telegram API failed');
                    
                    const data = await res.json();
                    
                    return (data.results || []).map((item: any) => ({
                        id: item.message_id,
                        title: item.file_name,
                        media_type: 'telegram',
                        release_date: new Date().toISOString().split('T')[0],
                        poster_path: null,
                        backdrop_path: null,
                        overview: `${(item.size / 1024 / 1024).toFixed(1)} MB | Channel: ${item.channel_id}`,
                        vote_average: 10,
                        is_telegram: true,
                        channel_id: item.channel_id,
                        message_id: item.message_id
                    }));
                } catch (err) {
                    console.error('Telegram search failed:', err);
                    return [];
                }
            }

            // 2. STANDARD TMDB SEARCH
            const res = await tmdb.search.multi({ query });
            return res.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
        },
        enabled: query.length > 0,
    });
};
