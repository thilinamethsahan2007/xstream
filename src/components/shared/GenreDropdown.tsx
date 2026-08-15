import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Genre {
    id: number;
    name: string;
}

interface GenreDropdownProps {
    genres: Genre[];
    selectedGenre: Genre | null;
    onSelect: (genre: Genre | null) => void;
}

export default function GenreDropdown({ genres, selectedGenre, onSelect }: GenreDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full transition-all backdrop-blur-md"
            >
                {selectedGenre ? selectedGenre.name : 'Genres'}
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-[#1c1c1e]/90 border border-white/10 rounded-2xl shadow-2xl z-50 backdrop-blur-xl scrollbar-hide">
                    <div className="grid grid-cols-1 p-2 gap-1">
                        <button
                            onClick={() => {
                                onSelect(null);
                                setIsOpen(false);
                            }}
                            className={`text-left px-4 py-3 text-sm rounded-xl transition-colors ${!selectedGenre ? 'text-white font-bold bg-white/10' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            All Genres
                        </button>
                        {genres.map((genre) => (
                            <button
                                key={genre.id}
                                onClick={() => {
                                    onSelect(genre);
                                    setIsOpen(false);
                                }}
                                className={`text-left px-4 py-3 text-sm rounded-xl transition-colors ${selectedGenre?.id === genre.id ? 'text-white font-bold bg-white/10' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
