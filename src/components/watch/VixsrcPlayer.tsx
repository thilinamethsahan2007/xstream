'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VixsrcPlayerProps {
    src: string;
    title?: string;
}

export default function VixsrcPlayer({ src, title }: VixsrcPlayerProps) {
    const router = useRouter();
    const [showControls, setShowControls] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

    const resetHideTimer = () => {
        setShowControls(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    useEffect(() => {
        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black group select-none"
            onMouseMove={resetHideTimer}
        >
            {/* Vixsrc Player Embed */}
            <iframe
                src={src}
                className="w-full h-full border-none"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="no-referrer"
                title="Vixsrc Video Player"
            />

            {/* Top Controls */}
            <div
                className={`absolute top-0 left-0 right-0 z-30 transition-opacity duration-500 ${
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div className="bg-gradient-to-b from-black/80 via-black/30 to-transparent px-6 py-5 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    {title && (
                        <h2 className="text-white font-semibold text-lg truncate max-w-[60%]">
                            {title.replace(/\.[^/.]+$/, '').replace(/[@_]/g, ' ').replace(/\s+/g, ' ').trim()}
                        </h2>
                    )}
                </div>
            </div>
        </div>
    );
}
