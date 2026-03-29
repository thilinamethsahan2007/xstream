import { useState, useEffect } from 'react';
import { X, Search, Film, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSearchMovies } from '@/hooks/useSearch';
import { useTrendingAll } from '@/hooks/useMovies';
import { useDebounce } from '@/hooks/useDebounce';
import MovieCard from '@/components/shared/MovieCard';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);
    const router = useRouter();

    const [isTelegramMode, setIsTelegramMode] = useState(false);

    const { data: searchResults, isLoading: searchLoading } = useSearchMovies(debouncedQuery, isTelegramMode);
    const { data: trendingResults, isLoading: trendingLoading } = useTrendingAll();

    const results = query ? searchResults : trendingResults;
    const isLoading = query ? searchLoading : trendingLoading;
    const title = query ? (isTelegramMode ? `Telegram Movies for "${query}"` : `Results for "${query}"`) : 'Trending Searches';

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setQuery(''); // Reset query when opened
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}&telegram=${isTelegramMode}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto scrollbar-hide">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-end mb-8">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="h-6 w-6 text-white" />
                    </button>
                </div>

                <div className="flex justify-center mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-[#1c1c1e] p-1.5 rounded-full border border-white/5 flex items-center shadow-2xl overflow-hidden max-w-md w-full sm:w-auto">
                        <button 
                            type="button"
                            onClick={() => setIsTelegramMode(false)}
                            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-500 flex-1 sm:flex-none ${!isTelegramMode ? 'bg-gradient-to-r from-white to-gray-200 text-black shadow-lg scale-100' : 'text-gray-400 hover:text-white scale-95'}`}
                        >
                            <Film className="w-4 h-4" /> Global TMDB
                        </button>
                        <button 
                            type="button"
                            onClick={() => setIsTelegramMode(true)}
                            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-500 flex-1 sm:flex-none ${isTelegramMode ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-100' : 'text-gray-400 hover:text-white scale-95'}`}
                        >
                            <Send className="w-4 h-4 fill-white" /> Telegram Source
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto mb-12">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={isTelegramMode ? "Search Telegram for Sinhala Movies..." : "Search for movies, TV shows..."}
                        className="w-full bg-transparent border-b border-gray-700 text-xl md:text-3xl font-medium text-white placeholder-gray-600 focus:outline-none focus:border-white py-3"
                        autoFocus
                    />
                    <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 p-2">
                        <Search className="h-6 w-6 text-gray-400" />
                    </button>
                </form>

                <div className="max-w-7xl mx-auto">
                    <h3 className="text-gray-400 mb-6">{title}</h3>
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="aspect-[2/3] bg-gray-800 rounded-md animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {results?.slice(0, 10).map((movie: any) => (
                                <div key={movie.id}>
                                    <MovieCard movie={movie as any} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
