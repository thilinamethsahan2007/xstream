'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MovieModal from '@/components/modal/MovieModal';
import ContentGrid from '@/components/shared/ContentGrid';
import { useSearchMovies } from '@/hooks/useSearch';
import { Film, Send } from 'lucide-react';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    
    // Telegram Toggle State
    const [isTelegramMode, setIsTelegramMode] = useState(false);
    
    // Pass the toggle state into our updated hook
    const { data: results, isLoading, error } = useSearchMovies(query, isTelegramMode);

    return (
        <main className="relative min-h-screen bg-[#141414]">
            <Navbar />

            <div className="pt-24 px-4 md:px-8 lg:px-16 pb-12">
                
                {/* Custom Toggle Switch for Telegram Streaming */}
                <div className="flex justify-center mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-[#1c1c1e] p-1.5 rounded-full border border-white/5 flex items-center shadow-2xl overflow-hidden max-w-md w-full sm:w-auto">
                        <button 
                            onClick={() => setIsTelegramMode(false)}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-500 flex-1 sm:flex-none ${!isTelegramMode ? 'bg-gradient-to-r from-white to-gray-200 text-black shadow-lg scale-100' : 'text-gray-400 hover:text-white scale-95'}`}
                        >
                            <Film className="w-4 h-4" /> Global TMDB
                        </button>
                        <button 
                            onClick={() => setIsTelegramMode(true)}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-500 flex-1 sm:flex-none ${isTelegramMode ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-100' : 'text-gray-400 hover:text-white scale-95'}`}
                        >
                            <Send className="w-4 h-4 fill-white" /> Telegram Source
                        </button>
                    </div>
                </div>

                <ContentGrid
                    title={query ? (isTelegramMode ? `Telegram Movies for "${query}"` : `Results for "${query}"`) : 'Search'}
                    movies={results || []}
                    isLoading={isLoading}
                    error={error as Error}
                />
            </div>

            <MovieModal />
        </main>
    );
}
