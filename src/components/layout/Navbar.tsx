'use client';

import { useState } from 'react';
import { Home, Search, Tv, Film, Clapperboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchModal from '@/components/search/SearchModal';
import { motion } from 'framer-motion';

export default function Navbar() {
    const [searchOpen, setSearchOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: '/tv', label: 'TV Shows', icon: Tv },
        { href: '/movies', label: 'Movies', icon: Film },
        { href: '/franchises', label: 'Franchises', icon: Clapperboard },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
            >
                <div className="flex items-center gap-2 px-4 py-3 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl">
                    <Link href="/" className="mr-4 ml-2 text-xl font-black tracking-tighter text-white flex items-center">
                        stream<span className="text-gray-400">X</span>
                    </Link>

                    <div className="flex items-center gap-1 md:gap-2">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "relative flex items-center gap-2 px-3 py-2 rounded-full transform active:scale-[0.97]",
                                        isActive ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
                                    )}
                                    style={{ transition: 'transform 160ms var(--ease-out), background-color 200ms var(--ease-out), color 200ms var(--ease-out)' }}
                                >
                                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                                    <span className={cn(
                                        "text-sm font-medium hidden",
                                        isActive ? "md:block" : ""
                                    )}>
                                        {link.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="w-px h-6 bg-white/20 mx-2" />

                    <button
                        onClick={() => setSearchOpen(true)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transform active:scale-[0.97]"
                        style={{ transition: 'transform 160ms var(--ease-out), background-color 200ms var(--ease-out), color 200ms var(--ease-out)' }}
                        aria-label="Search"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                </div>
            </motion.nav>

            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
