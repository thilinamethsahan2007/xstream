'use client';

import { useState, useEffect } from 'react';
import { Send, Search, Film, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
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
        overview: `${(item.size / 1024 / 1024).toFixed(1)} MB | Channel: ${item.channel_id}`,
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

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            const results: Record<string, TelegramResult[]> = {};

            await Promise.all(
                CATEGORIES.map(async (cat) => {
                    try {
                        const url = cat.query
                            ? `/api/telegram/search?query=${encodeURIComponent(cat.query)}`
                            : `/api/telegram/search?query=movie`;
                        const res = await fetch(url);
                        if (res.ok) {
                            const data = await res.json();
                            results[cat.label] = mapTelegramResults(data);
                        }
                    } catch (err) {
                        console.error(`Failed to fetch ${cat.label}:`, err);
                    }
                })
            );

            setCategories(results);
            setLoading(false);
        };

        fetchCategories();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`/api/telegram/search?query=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(mapTelegramResults(data));
            }
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-[#0a0a0f]">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-indigo-950/50 to-[#0a0a0f]" />
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-[10%] w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
                    <div className="absolute top-40 right-[30%] w-40 h-40 bg-purple-500/10 rounded-full blur-[80px] animate-pulse delay-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />

                <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-6">
                        <Send className="w-9 h-9 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-3">
                        Sinhala Movies
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg max-w-md mb-8">
                        Stream Sinhala dubbed & subtitled movies directly from Telegram
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative w-full max-w-lg">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for a movie..."
                            className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 pl-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base transition-all"
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="relative z-10 px-4 md:px-12 pb-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Film className="w-6 h-6 text-blue-400" />
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
                        <p className="text-gray-500 text-sm">Loading Telegram library...</p>
                    </div>
                ) : (
                    CATEGORIES.map((cat) => {
                        const items = categories[cat.label];
                        if (!items || items.length === 0) return null;
                        return (
                            <div key={cat.label}>
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-500 rounded-full" />
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
