'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PreloaderProps {
    onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
    const [phase, setPhase] = useState<'draw' | 'fill' | 'fadeOut'>('draw');

    useEffect(() => {
        // Outline draws as a single continuous line for 2s. We wait until 2.3s to fire flash.
        const timer1 = setTimeout(() => setPhase('fill'), 2300); 
        // Pause to appreciate the impact
        const timer2 = setTimeout(() => setPhase('fadeOut'), 3500); 
        // Complete and unmount
        const timer3 = setTimeout(() => onComplete(), 4100);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === 'fadeOut' ? 0 : 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            // Pure black background
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
        >
            <div className="relative w-full max-w-[90vw] md:max-w-[700px] flex justify-center items-center">
                
                {/* SVG Text Layer for the single continuous laser drawing animation */}
                <svg
                    viewBox="0 0 800 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                >
                    <defs>
                        <linearGradient id="laser-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="50%" stopColor="#f0f0f0" />
                            <stop offset="100%" stopColor="#cccccc" />
                        </linearGradient>
                    </defs>

                    <motion.text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontFamily='system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        fontWeight="900"
                        fontSize="100px"
                        letterSpacing="15"
                        stroke="url(#laser-gradient)"
                        initial={{
                            // Massive stroke dash to trace across all letters continuously
                            strokeDasharray: "2500",
                            strokeDashoffset: "2500",
                            fill: "rgba(255, 255, 255, 0)",
                            strokeWidth: "2"
                        }}
                        animate={{
                            strokeDashoffset: "0",
                            // Fill triggers purely at phase 'fill'
                            fill: phase === 'fill' ? "#ffffff" : "rgba(255, 255, 255, 0)",
                            strokeWidth: phase === 'fill' ? "0" : "2"
                        }}
                        transition={{
                            // The single continuous trace
                            strokeDashoffset: { duration: 2, ease: "easeInOut" },
                            fill: { duration: 0.3, ease: "easeOut" },
                            strokeWidth: { duration: 0.3 }
                        }}
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
            </div>
        </motion.div>
    );
}
