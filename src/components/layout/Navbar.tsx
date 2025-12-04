'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchModal from '@/components/search/SearchModal';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isFranchisePage = pathname?.startsWith('/franchises');

    return (
        <>
            <nav
                className={cn(
                    'fixed top-0 z-50 w-full px-4 py-4 md:px-12 transition-all duration-500',
                    isScrolled ? 'material-regular border-b border-white/5 h-16' : 'bg-transparent h-20'
                )}
            >
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-6 md:gap-10">
                        <Link href="/" className="text-2xl sm:text-3xl font-bold tracking-tight text-label-primary hover:text-label-secondary transition-colors">
                            StreamX
                        </Link>

                        <div className="flex items-center gap-6 md:gap-8">
                            <Link href="/" className="hidden md:block text-sm font-medium text-label-secondary hover:text-label-primary transition-colors">
                                Home
                            </Link>
                            <Link href="/tv" className="text-xs sm:text-sm font-medium text-label-secondary hover:text-label-primary transition-colors">
                                TV Shows
                            </Link>
                            <Link href="/movies" className="text-xs sm:text-sm font-medium text-label-secondary hover:text-label-primary transition-colors">
                                Movies
                            </Link>
                            <Link href="/franchises" className="text-xs sm:text-sm font-medium text-label-secondary hover:text-label-primary transition-colors">
                                Franchises
                            </Link>
                        </div>
                    </div>

                    {!isFranchisePage && (
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-2 text-label-secondary hover:text-label-primary hover:bg-label-primary/10 rounded-full transition-all duration-300"
                            aria-label="Search"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </nav>

            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
