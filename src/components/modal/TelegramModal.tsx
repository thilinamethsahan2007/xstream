'use client';

import { useTelegramModalStore } from '@/store/telegramModalStore';
import { X, Play, Send, HardDrive, Film, FileVideo, Zap } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TelegramModal() {
    const { isOpen, movie, closeModal, openModal } = useTelegramModalStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);
    const hasHydrated = useRef(false);

    useEffect(() => {
        setIsMounted(true);

        const tmParam = searchParams.get('telegram');
        if (tmParam && !isOpen && !hasHydrated.current) {
            hasHydrated.current = true;
            const stored = sessionStorage.getItem('streamx_telegram_modal');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.message_id.toString() === tmParam || parsed.id.toString() === tmParam) {
                        openModal(parsed);
                    }
                } catch (e) {
                    // Ignore
                }
            }
        }

        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            if (!params.get('telegram') && useTelegramModalStore.getState().isOpen) {
                useTelegramModalStore.getState().closeModal();
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [searchParams, isOpen, openModal]);

    useEffect(() => {
        if (!isMounted) return;

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (movie) {
                sessionStorage.setItem('streamx_telegram_modal', JSON.stringify(movie));
                const currentParams = new URLSearchParams(window.location.search);
                const idStr = (movie.message_id || movie.id).toString();
                if (currentParams.get('telegram') !== idStr) {
                    currentParams.set('telegram', idStr);
                    window.history.pushState(null, '', `${pathname}?${currentParams.toString()}`);
                }
            }
        } else {
            document.body.style.overflow = 'unset';

            const currentParams = new URLSearchParams(window.location.search);
            if (currentParams.has('telegram')) {
                currentParams.delete('telegram');
                const newUrl = currentParams.toString() ? `${pathname}?${currentParams.toString()}` : pathname;
                window.history.pushState(null, '', newUrl);
            }
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, movie, isMounted, pathname]);

    if (!isMounted || !movie) return null;

    const fileSizeMB = (movie.size / 1024 / 1024).toFixed(1);
    const fileSizeGB = (movie.size / 1024 / 1024 / 1024).toFixed(2);
    const isLargeFile = movie.size > 1024 * 1024 * 1024;
    const fileExtension = movie.title.split('.').pop()?.toUpperCase() || 'VIDEO';

    const handlePlay = () => {
        // Do not call closeModal() here to avoid race condition with router.push
        router.push(`/watch/telegram/${movie.message_id}?channel=${encodeURIComponent(movie.channel_id)}`);
    };

    // Extract a clean title from the filename
    const cleanTitle = movie.title
        .replace(/\.[^/.]+$/, '') // Remove file extension
        .replace(/[@_]/g, ' ')   // Replace @ and _ with spaces
        .replace(/\s+/g, ' ')    // Collapse multiple spaces
        .trim();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xl"
                        onClick={closeModal}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: "spring", damping: 28, stiffness: 350 }}
                        className="fixed inset-4 sm:inset-8 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[100] md:max-w-2xl md:w-full overflow-hidden rounded-2xl bg-[#1c1c1e] text-white shadow-2xl border border-white/10"
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute right-4 top-4 z-50 rounded-full bg-white/5 p-2 hover:bg-white/10 backdrop-blur-sm transition-colors border border-white/10"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Hero Section */}
                        <div className="relative h-[160px] sm:h-[200px] w-full overflow-hidden bg-black/50">
                            {/* Animated Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-transparent to-transparent" />

                            {/* Center Icon */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2, damping: 15 }}
                                    className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2"
                                >
                                    <Film className="w-8 h-8 text-gray-400" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 sm:px-8 pb-8 pt-2 space-y-6">
                            {/* Title */}
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-2">
                                    {cleanTitle}
                                </h2>
                                <p className="text-sm text-gray-400 font-mono truncate">
                                    {movie.title}
                                </p>
                            </div>

                            {/* File Info Cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-[#2c2c2e] rounded-xl p-4 text-center">
                                    <HardDrive className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                                    <p className="text-white font-bold text-sm">{isLargeFile ? `${fileSizeGB} GB` : `${fileSizeMB} MB`}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">File Size</p>
                                </div>
                                <div className="bg-[#2c2c2e] rounded-xl p-4 text-center">
                                    <FileVideo className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                                    <p className="text-white font-bold text-sm">{fileExtension}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">Format</p>
                                </div>
                                <div className="bg-[#2c2c2e] rounded-xl p-4 text-center">
                                    <Zap className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                                    <p className="text-white font-bold text-sm truncate">High Quality</p>
                                    <p className="text-gray-500 text-xs mt-0.5">Stream Quality</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-[#2c2c2e] rounded-xl p-4">
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    This video will be streamed directly from our high-speed secure servers.
                                    Playback uses advanced buffering for instant seeking and smooth streaming.
                                </p>
                            </div>

                            {/* Play Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePlay}
                                className="w-full flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-bold text-black hover:bg-gray-200 transition-colors shadow-lg"
                            >
                                <Play className="h-6 w-6 fill-black" />
                                Play
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
