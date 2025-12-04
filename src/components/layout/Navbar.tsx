'use client';

import { useEffect, useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchModal from '@/components/search/SearchModal';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const isFranchisePage = pathname?.startsWith('/franchises');

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/tv', label: 'TV Shows' },
        { href: '/movies', label: 'Movies' },
        { href: '/franchises', label: 'Franchises' },
    ];

    return (
        <>
            <nav
                className={cn(
                    'fixed top-0 z-50 w-full px-4 py-4 md:px-12 transition-all duration-500',
                    isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 h-16' : 'bg-transparent h-20'
                )}
            >
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-6 md:gap-10">
                        <Link href="/" className="text-2xl sm:text-3xl font-bold tracking-tight text-label-primary hover:text-label-secondary transition-colors z-50 relative">
                            StreamX
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm font-medium text-label-secondary hover:text-label-primary transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {!isFranchisePage && (
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2 text-label-secondary hover:text-label-primary hover:bg-label-primary/10 rounded-full transition-all duration-300"
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-label-secondary hover:text-label-primary hover:bg-label-primary/10 rounded-full transition-all duration-300 z-50 relative"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-background/95 backdrop-blur-xl transition-all duration-500 md:hidden flex flex-col items-center justify-center gap-8',
                    mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
            >
                {navLinks.map((link, index) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "text-3xl font-bold text-label-primary hover:text-label-secondary transition-all duration-500 transform",
                            mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                        )}
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
