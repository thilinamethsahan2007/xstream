'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PreloaderProps {
    onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
    const [phase, setPhase] = useState<'draw' | 'fill' | 'fadeOut'>('draw');
    const [isLoaded, setIsLoaded] = useState(false);
    const [minTimeReached, setMinTimeReached] = useState(false);

    // Track document load status
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (document.readyState === 'complete') {
                setIsLoaded(true);
            } else {
                const handleLoad = () => setIsLoaded(true);
                window.addEventListener('load', handleLoad);
                return () => window.removeEventListener('load', handleLoad);
            }
        }
    }, []);

    // Enforce minimum animation time
    useEffect(() => {
        // Outline draws as a single continuous line for 2s. We wait until 2.3s to fire flash.
        const timer1 = setTimeout(() => setPhase('fill'), 2300); 
        // Pause to appreciate the impact, then flag minTimeReached
        const timer2 = setTimeout(() => setMinTimeReached(true), 3500); 

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    // Trigger fadeOut only when BOTH conditions are met
    useEffect(() => {
        if (minTimeReached && isLoaded) {
            setPhase('fadeOut');
            const timer = setTimeout(() => onComplete(), 800); // 800ms fadeOut duration
            return () => clearTimeout(timer);
        }
    }, [minTimeReached, isLoaded, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === 'fadeOut' ? 0 : 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            // Pure black background
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
        >
            <motion.div 
                className="relative w-full max-w-[90vw] md:max-w-[700px] flex justify-center items-center"
                animate={{ 
                    scale: phase === 'fadeOut' ? 15 : 1, 
                    filter: phase === 'fadeOut' ? 'blur(10px)' : 'blur(0px)' 
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
                
                {/* SVG Text Layer for the STREAMX logo */}
                <svg
                    viewBox="0 0 800 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto transition-all duration-500"
                    style={{
                        filter: phase === 'draw' ? 'none' : 'drop-shadow(0 0 15px rgba(255,255,255,0.9))'
                    }}
                >
                    <motion.text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontFamily='system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        fontWeight="900"
                        fontSize="100px"
                        letterSpacing="15"
                        fill="#ffffff"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: phase === 'fadeOut' ? 0 : 1 }}
                        transition={{ duration: 0.6, ease: 'easeIn' }}
                    >
                        STREAMX
                    </motion.text>
                </svg>

                {/* Laser Flash overlay: expands and vanishes when color fills */}
                <motion.div
                    initial={{ opacity: 0, scaleY: 0, scaleX: 0 }}
                    animate={
                        phase === 'fill'
                            ? { opacity: [0, 1, 0], scaleY: [0, 4, 0], scaleX: [0.8, 1.2, 1.4] }
                            : { opacity: 0 }
                    }
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute top-[48%] left-10 right-10 h-[2px] bg-white -translate-y-1/2 blur-[6px] pointer-events-none mix-blend-screen"
                />

                {/* Intense glowing white orb behind the text during the fill flash */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={
                        phase === 'fill'
                            ? { opacity: [0, 0.25, 0], scale: [0.8, 1.2, 1.5] }
                            : { opacity: 0 }
                    }
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 w-full max-w-[500px] h-[150px] -translate-x-1/2 -translate-y-1/2 bg-white blur-[80px] rounded-[100%] pointer-events-none -z-10 mix-blend-screen"
                />
            </motion.div>
        </motion.div>
    );
}
