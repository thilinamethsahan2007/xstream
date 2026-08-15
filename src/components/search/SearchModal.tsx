import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSearchMovies } from '@/hooks/useSearch';
import { useTrendingAll } from '@/hooks/useMovies';
import { useDebounce } from '@/hooks/useDebounce';
import MovieCard from '@/components/shared/MovieCard';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);
    const router = useRouter();

    // TMDB: live debounced search
    const { data: searchResults, isLoading: searchLoading } = useSearchMovies(debouncedQuery);
    const { data: trendingResults, isLoading: trendingLoading } = useTrendingAll();

    // Pick the right results based on mode
    const results = query ? searchResults : trendingResults;
    const isLoading = query ? searchLoading : trendingLoading;
    const title = query ? `Results for "${query}"` : 'Trending Searches';

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setQuery('');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Navigate to full search page for TMDB
        router.push(`/search?q=${encodeURIComponent(query)}`);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-3xl overflow-y-auto scrollbar-hide"
                >
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex justify-end mb-8">
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        {/* Search Input */}
                        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto mb-16 mt-12">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search movies, TV shows..."
                                className="w-full bg-transparent border-none text-4xl md:text-6xl font-black text-white placeholder-white/20 focus:outline-none focus:ring-0 py-4 tracking-tighter"
                                autoFocus
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors hover:bg-white/10 rounded-full">
                                <Search className="h-8 w-8" strokeWidth={3} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </form>

                        {/* Results */}
                        <div className="max-w-7xl mx-auto px-4 md:px-8">
                            <h3 className="text-white/40 font-semibold tracking-widest uppercase text-sm mb-8">{title}</h3>
                            {isLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="aspect-[2/3] bg-gray-800 rounded-md animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {results?.slice(0, 15).map((movie: any) => (
                                        <div key={movie.id}>
                                            <MovieCard movie={movie as any} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
