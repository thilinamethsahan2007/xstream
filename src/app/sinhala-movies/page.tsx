'use client';

import { useState, useEffect } from 'react';
import { Send, Search, Film, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import MovieCard from '@/components/shared/MovieCard';
import TelegramModal from '@/components/modal/TelegramModal';

interface TelegramResult {
    id: number;
    title: string;
    channel_id: string;
    message_id: number;
    overview: string;
    poster_path: null;
    backdrop_path: null;
    vote_average: number;
    is_telegram: true;
    raw_size: number;
    mime_type: string;
    release_date: string;
    media_type: string;
}

const CATEGORIES = [
    { label: 'Recently Added', query: '' },
    { label: 'Action & Thriller', query: 'action' },
    { label: 'Horror', query: 'horror' },
    { label: 'Comedy', query: 'comedy' },
    { label: 'Animation & Cartoon', query: 'cartoon' },
    { label: 'Marvel & DC', query: 'marvel' },
    { label: 'Sinhala Dubbed', query: 'sinhala' },
];

function mapTelegramResults(data: any): TelegramResult[] {
    return (data.results || []).map((item: any) => ({
        id: item.message_id,
        title: item.file_name,
        media_type: 'telegram',
        release_date: new Date().toISOString().split('T')[0],
        poster_path: null,
        backdrop_path: null,
        overview: `${(item.size / 1024 / 1024).toFixed(1)} MB | High Quality Stream`,
        vote_average: 10,
        is_telegram: true,
        channel_id: item.channel_id,
        message_id: item.message_id,
        raw_size: item.size,
        mime_type: item.mime_type || 'video/mp4'
    }));
}

export default function TelegramBrowsePage() {
    const [categories, setCategories] = useState<Record<string, TelegramResult[]>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<TelegramResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [randomVideoIndex, setRandomVideoIndex] = useState(0);

    useEffect(() => {
        // Only setup background video on non-mobile devices
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            setRandomVideoIndex(Math.floor(Math.random() * 20));
        }
        const storedQuery = sessionStorage.getItem('streamx_telegram_search_query');
        const storedResults = sessionStorage.getItem('streamx_telegram_search_results');
        
        if (storedQuery && storedResults) {
            setSearchQuery(storedQuery);
            try {
                setSearchResults(JSON.parse(storedResults));
            } catch (e) {}
        }

        const fetchCategories = async () => {
            setLoading(true);

            for (const cat of CATEGORIES) {
                try {
                    const url = cat.query
                        ? `/api/telegram/search?query=${encodeURIComponent(cat.query)}`
                        : `/api/telegram/search?query=movie`;
                    const res = await fetch(url);
                    if (res.ok) {
                        const data = await res.json();
                        setCategories(prev => ({
                            ...prev,
                            [cat.label]: mapTelegramResults(data)
                        }));
                        // Stop the global loading spinner once the first category is ready
                        setLoading(false);
                    }
                } catch (err) {
                    console.error(`Failed to fetch ${cat.label}:`, err);
                }
            }
            
            // Ensure loading is false even if all requests failed
            setLoading(false);
        };

        fetchCategories();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults([]);
            sessionStorage.removeItem('streamx_telegram_search_query');
            sessionStorage.removeItem('streamx_telegram_search_results');
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/telegram/search?query=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                const mapped = mapTelegramResults(data);
                setSearchResults(mapped);
                sessionStorage.setItem('streamx_telegram_search_query', searchQuery);
                sessionStorage.setItem('streamx_telegram_search_results', JSON.stringify(mapped));
            }
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-black">
            <Navbar />

            {/* Custom Hero Banner for Sinhala Movies */}
            <div className="relative w-full pt-32 pb-16 md:pt-48 md:pb-24 px-4 md:px-12 flex flex-col items-center justify-center overflow-hidden h-[85vh] md:h-[95vh]">
                {/* Stunning Background Gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black to-indigo-900/20" />
                
                {/* Background Video */}
                <div className={`absolute inset-0 z-0 overflow-hidden bg-black transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-40' : 'opacity-0'}`}>
                    <div className="relative w-full h-[300%] -top-[100%] pointer-events-none">
                        <iframe
                            src={`https://www.youtube.com/embed?listType=playlist&list=PLqmQBMqNj6IepFK3i7lL86SwfLxu-cx3p&index=${randomVideoIndex}&autoplay=1&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&vq=medium`}
                            className="absolute top-0 left-0 w-full h-full scale-[1.35]"
                            allow="autoplay; encrypted-media"
                            title="Trailer"
                            onLoad={() => {
                                setTimeout(() => setIsVideoLoaded(true), 1500);
                            }}
                        />
                    </div>
                </div>

                {/* Glowing Orbs */}
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />
                <div className="absolute right-0 bottom-0 -z-10 h-[250px] w-[250px] rounded-full bg-indigo-500 opacity-20 blur-[100px] translate-x-1/4 translate-y-1/4" />
                
                <div className="relative z-20 flex flex-col items-center justify-center w-full text-center mt-8 md:mt-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <h1 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-[1.1] mb-6">
                            Sinhala Movies
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 font-medium tracking-wide mx-auto">
                            Stream the largest collection of Sinhala dubbed & subtitled movies in high quality.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.form 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                        onSubmit={handleSearch} 
                        className="relative w-full max-w-2xl group shadow-2xl shadow-blue-500/10 rounded-full transition-shadow duration-300 hover:shadow-blue-500/20"
                    >
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for a movie..."
                            className="w-full bg-[#1c1c1e]/60 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-5 pl-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-lg transition-all"
                        />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-full text-base font-bold transition-transform transform active:scale-95 disabled:opacity-50"
                        >
                            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                        </button>
                    </motion.form>
                </div>
                
                {/* Bottom Gradient Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-48 md:h-64 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="relative z-10 px-4 md:px-12 pb-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        Search Results for &ldquo;{searchQuery}&rdquo;
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {searchResults.map((movie: any) => (
                            <MovieCard key={`${movie.channel_id}-${movie.id}`} movie={movie as any} />
                        ))}
                    </div>
                </div>
            )}

            {/* Browse Categories */}
            <div className="relative z-10 px-4 md:px-12 pb-20 space-y-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <p className="text-gray-500 text-sm">Loading Sinhala Movies library...</p>
                    </div>
                ) : (
                    CATEGORIES.map((cat) => {
                        const items = categories[cat.label];
                        if (!items || items.length === 0) return null;
                        return (
                            <div key={cat.label}>
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                                    {cat.label}
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {items.slice(0, 12).map((movie: any) => (
                                        <MovieCard key={`${movie.channel_id}-${movie.id}`} movie={movie as any} />
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <TelegramModal />
        </main>
    );
}
