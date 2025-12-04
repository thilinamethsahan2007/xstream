'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Timeline from '@/components/franchise/Timeline';
import MovieModal from '@/components/modal/MovieModal';
import { FranchiseContent } from '@/hooks/useFranchise';

import { useFranchiseStore } from '@/store/franchiseStore';
import { supabase } from '@/lib/supabase';
import { RefreshCw } from 'lucide-react';

export default function FranchiseSearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [content, setContent] = useState<FranchiseContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const addFranchise = useFranchiseStore((state) => state.addFranchise);

    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const fetchFromDB = async () => {
        if (!query) return false;

        const franchiseId = `ai-${query.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const { data } = await supabase
            .from('franchises')
            .select('*')
            .eq('id', franchiseId)
            .single();

        if (data) {
            setLastUpdated(data.updated_at);

            // If we have stored content, use it!
            if (data.content && Array.isArray(data.content) && data.content.length > 0) {
                setContent(data.content);
                setLoading(false);
                return true;
            }
            return false;
        }
        return false;
    };

    const generateContent = async (forceRefresh = false) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/ai-franchise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch franchise');
            }

            setContent(data.content);

            // Update local timestamp if we just refreshed
            if (forceRefresh) {
                setLastUpdated(new Date().toISOString());
            } else {
                // Try to fetch timestamp from DB if we didn't just force refresh (e.g. initial load)
                const franchiseId = `ai-${query!.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                const { data: dbData } = await supabase.from('franchises').select('updated_at').eq('id', franchiseId).single();
                if (dbData) setLastUpdated(dbData.updated_at);
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!query) return;

        const init = async () => {
            setLoading(true);
            const foundInDB = await fetchFromDB();
            if (!foundInDB) {
                generateContent();
            }
        };

        init();
    }, [query]);

    const handleRefresh = () => {
        generateContent(true);
    };

    return (
        <main className="min-h-screen bg-transparent">
            <Navbar />

            <div className="pt-24 pb-12 container mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">
                        Timeline: <span className="text-blue-500">{query}</span>
                    </h1>

                    {lastUpdated && (
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Last updated</p>
                                <p className="text-sm font-mono text-white">
                                    {new Date(lastUpdated).toLocaleDateString()} {new Date(lastUpdated).toLocaleTimeString()}
                                </p>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                                title="Refresh Timeline"
                            >
                                <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500 text-xl">{error}</p>
                        {error.includes('API Key') && (
                            <p className="text-gray-400 mt-2">Please add GEMINI_API_KEY to your .env.local file.</p>
                        )}
                    </div>
                ) : (
                    <Timeline content={content} />
                )}
            </div>

            <MovieModal />
        </main>
    );
}
