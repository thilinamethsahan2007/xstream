import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
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

    const { data: searchResults, isLoading: searchLoading } = useSearchMovies(debouncedQuery);
    const { data: trendingResults, isLoading: trendingLoading } = useTrendingAll();

    const results = query ? searchResults : trendingResults;
    const isLoading = query ? searchLoading : trendingLoading;
    const title = query ? `Results for "${query}"` : 'Trending Searches';

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
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
            router.push(`/search?q=${encodeURIComponent(query)}`);
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

                <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto mb-12">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for movies, TV shows..."
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
                            {results?.slice(0, 10).map((movie) => (
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
