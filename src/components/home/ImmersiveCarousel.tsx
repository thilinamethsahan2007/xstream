'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { getImageUrl, cn } from '@/lib/utils';
import { useModalStore } from '@/store/modalStore';
import { useTrendingAll } from '@/hooks/useMovies';

export default function ImmersiveCarousel() {
    const { data: trending, isLoading } = useTrendingAll();
    const openModal = useModalStore(state => state.openModal);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi, setSelectedIndex]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    if (isLoading || !trending) {
        return (
            <div className="w-full h-screen bg-black flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    // Limit to top 15 for the immersive carousel to keep it curated
    const items = trending.filter(item => item.media_type === 'movie' || item.media_type === 'tv').slice(0, 15) as any[];

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden group">
            <div className="absolute inset-0 z-0" ref={emblaRef}>
                <div className="flex h-full touch-pan-y">
                    {items.map((item, index) => {
                        const isSelected = index === selectedIndex;
                        const bgUrl = getImageUrl(item.backdrop_path, 'original');
                        const title = item.title || item.name;
                        
                        return (
                            <div 
                                key={item.id} 
                                className="flex-[0_0_100%] min-w-0 h-full relative"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
                                    <img
                                        src={bgUrl}
                                        alt={title}
                                        className={cn(
                                            "w-full h-full object-cover transition-transform duration-[20s] ease-out",
                                            isSelected ? "scale-110" : "scale-100"
                                        )}
                                    />
                                    {/* Gradient Overlays for readability and immersion */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent opacity-80" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Foreground Content - Changes based on selected index */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end pb-32 px-6 md:px-16 lg:px-24">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="max-w-3xl pointer-events-auto"
                    >
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl"
                        >
                            {items[selectedIndex].title || items[selectedIndex].name}
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                            className="text-lg md:text-xl text-white/80 line-clamp-3 mb-8 max-w-2xl font-light"
                        >
                            {items[selectedIndex].overview}
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.6 }}
                            className="flex items-center gap-4"
                        >
                            <button
                                onClick={() => openModal(items[selectedIndex])}
                                className="group relative flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <Play className="w-5 h-5 fill-black" />
                                <span>Play</span>
                            </button>
                            
                            <button
                                onClick={() => openModal(items[selectedIndex])}
                                className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 border border-white/20"
                            >
                                <Info className="w-5 h-5" />
                                <span>More Info</span>
                            </button>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination / Progress Dots */}
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => emblaApi?.scrollTo(index)}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            index === selectedIndex ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
            
            {/* Minimalist gradient at bottom to fade into the next section if any */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-0" />
        </div>
    );
}
