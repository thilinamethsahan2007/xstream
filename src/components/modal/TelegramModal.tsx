'use client';

import { useTelegramModalStore } from '@/store/telegramModalStore';
import { X, Play, Send, HardDrive, Film, FileVideo, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TelegramModal() {
    const { isOpen, movie, closeModal } = useTelegramModalStore();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isMounted || !movie) return null;

    const fileSizeMB = (movie.size / 1024 / 1024).toFixed(1);
    const fileSizeGB = (movie.size / 1024 / 1024 / 1024).toFixed(2);
    const isLargeFile = movie.size > 1024 * 1024 * 1024;
    const fileExtension = movie.title.split('.').pop()?.toUpperCase() || 'VIDEO';

    const handlePlay = () => {
        closeModal();
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
                        className="fixed inset-4 sm:inset-8 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[100] md:max-w-2xl md:w-full overflow-hidden rounded-3xl bg-gradient-to-b from-[#1a1a2e] to-[#16162a] text-white shadow-2xl shadow-blue-500/10 border border-blue-500/10"
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute right-4 top-4 z-50 rounded-full bg-white/5 p-2 hover:bg-white/10 backdrop-blur-sm transition-colors border border-white/10"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Hero Section */}
                        <div className="relative h-[200px] sm:h-[260px] w-full overflow-hidden">
                            {/* Animated Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-900/30 to-purple-900/20" />
                            <div className="absolute inset-0">
                                <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />

                            {/* Center Icon */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2, damping: 15 }}
                                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-4"
                                >
                                    <Send className="w-9 h-9 text-white" />
                                </motion.div>
                                <motion.span 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-blue-300/60 text-xs font-bold tracking-[0.3em] uppercase"
                                >
                                    Telegram Stream
                                </motion.span>
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
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                                    <HardDrive className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                                    <p className="text-white font-bold text-sm">{isLargeFile ? `${fileSizeGB} GB` : `${fileSizeMB} MB`}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">File Size</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                                    <FileVideo className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                                    <p className="text-white font-bold text-sm">{fileExtension}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">Format</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                                    <Film className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                                    <p className="text-white font-bold text-sm truncate">{movie.channel_id.replace('@', '')}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">Channel</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm font-semibold text-gray-300">Stream Info</span>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    This video will be streamed directly from Telegram servers through our secure proxy.
                                    Playback uses HTTP Range requests for instant seeking and buffered streaming.
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-green-400 font-medium">Proxy Server Online</span>
                                </div>
                            </div>

                            {/* Play Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePlay}
                                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-500/20 active:shadow-blue-500/10"
                            >
                                <Play className="h-6 w-6 fill-white" />
                                Stream Now
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
