'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, ChevronRight } from 'lucide-react';
import { Franchise } from '@/lib/franchises';
import { cn } from '@/lib/utils';

interface FranchiseSearchProps {
    franchises: (Franchise & { isCustom?: boolean })[];
}

export default function FranchiseSearch({ franchises }: FranchiseSearchProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<(Franchise & { isCustom?: boolean })[]>([]);
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        const filtered = franchises.filter(f =>
            f.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5); // Limit to 5 suggestions

        setSuggestions(filtered);
    }, [query, franchises]);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setIsOpen(false);
        // If exact match found in suggestions, go there
        const exactMatch = suggestions.find(s => s.name.toLowerCase() === query.toLowerCase());
        if (exactMatch) {
            handleSelect(exactMatch);
        } else {
            // Otherwise, go to search page (which triggers AI)
            router.push(`/franchises/search?q=${encodeURIComponent(query)}`);
        }
    };

    const handleSelect = (franchise: Franchise & { isCustom?: boolean }) => {
        setQuery(franchise.name);
        setIsOpen(false);
        if (franchise.isCustom) {
            router.push(`/franchises/search?q=${encodeURIComponent(franchise.name)}`);
        } else {
            router.push(`/franchises/${franchise.id}`);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full md:w-[500px] group z-50">
            <div className="relative">
                <div className={cn(
                    "absolute -inset-0.5 bg-white/10 rounded-full opacity-0 transition duration-500 blur-md",
                    isOpen ? "opacity-100" : "opacity-0"
                )}></div>
                <form onSubmit={handleSearch} className="relative flex items-center">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Search or create with AI..."
                        className="w-full bg-black/40 backdrop-blur-3xl text-white pl-12 pr-4 py-4 rounded-full border border-white/10 focus:border-white/30 focus:outline-none focus:ring-0 placeholder-white/30 shadow-2xl transition-all font-medium"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    {query && (
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors shadow-lg"
                        >
                            <ChevronRight className="h-4 w-4 text-white" />
                        </button>
                    )}
                </form>
            </div>

            {/* Dropdown */}
            {isOpen && query.trim() && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                    {suggestions.length > 0 && (
                        <div className="py-2">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Existing Franchises
                            </div>
                            {suggestions.map((franchise) => (
                                <button
                                    key={franchise.id}
                                    onClick={() => handleSelect(franchise)}
                                    className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center justify-between group/item transition-colors"
                                >
                                    <span className="text-gray-200 group-hover/item:text-white font-medium">{franchise.name}</span>
                                    {franchise.isCustom && (
                                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">AI Generated</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-white/10 p-2">
                        <button
                            onClick={() => handleSearch()}
                            className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-3 group/ai transition-all border border-white/5"
                        >
                            <div className="p-2 bg-white/10 rounded-lg group-hover/ai:bg-white/20 transition-colors shadow-lg">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white tracking-tight">Create "{query}"</p>
                                <p className="text-xs text-white/50">Generate a new timeline with AI</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
