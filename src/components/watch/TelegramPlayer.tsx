'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Play, Pause, Volume2, VolumeX, Volume1,
    Maximize, Minimize, PictureInPicture2,
    SkipBack, SkipForward, Settings, ArrowLeft, Copy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Hls from 'hls.js';

interface TelegramPlayerProps {
    src: string;
    title?: string;
    onVideoError?: () => void;
    initialTime?: number;
    onProgress?: (progress: number, duration: number) => void;
}

function formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TelegramPlayer({ src, title, onVideoError, initialTime, onProgress }: TelegramPlayerProps) {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverX, setHoverX] = useState(0);
    const [showCenterIcon, setShowCenterIcon] = useState<'play' | 'pause' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hasVideoCodecIssue, setHasVideoCodecIssue] = useState(false);

    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    // Auto-hide controls
    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        if (isPlaying) {
            hideTimerRef.current = setTimeout(() => {
                setShowControls(false);
                setShowSpeedMenu(false);
            }, 3000);
        }
    }, [isPlaying]);

    useEffect(() => {
        resetHideTimer();
    }, [isPlaying, resetHideTimer]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const video = videoRef.current;
            if (!video) return;

            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    video.currentTime = Math.min(duration, video.currentTime + 10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVolume(v => Math.min(1, v + 0.1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVolume(v => Math.max(0, v - 0.1));
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    setIsMuted(m => !m);
                    break;
                case 'Escape':
                    setShowSpeedMenu(false);
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [duration]);

    // Sync volume
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);

    // Fullscreen change listener
    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Handle HLS and Native SRC injection
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) return;

        let hls: Hls | null = null;

        const isM3U8 = src.includes('.m3u8');

        if (isM3U8 && Hls.isSupported()) {
            hls = new Hls({
                maxBufferSize: 30 * 1000 * 1000,
            });
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    if (onVideoError) {
                        hls?.destroy();
                        onVideoError();
                        return;
                    }
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('HLS stream network error, trying to recover...', data);
                            hls?.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('HLS stream media error, trying to recover...', data);
                            hls?.recoverMediaError();
                            break;
                        default:
                            setIsLoading(false);
                            setErrorMessage(`HLS stream failed: ${data.details}`);
                            hls?.destroy();
                            break;
                    }
                }
            });
        } else {
            video.src = src;
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
            video.src = '';
        };
    }, [src]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
            flashCenterIcon('play');
        } else {
            video.pause();
            setIsPlaying(false);
            flashCenterIcon('pause');
        }
    };

    const flashCenterIcon = (icon: 'play' | 'pause') => {
        setShowCenterIcon(icon);
        setTimeout(() => setShowCenterIcon(null), 600);
    };

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        } else {
            await containerRef.current.requestFullscreen();
        }
    };

    const togglePiP = async () => {
        const video = videoRef.current;
        if (!video) return;
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else {
            await video.requestPictureInPicture();
        }
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;
        setCurrentTime(video.currentTime);

        if (video.buffered.length > 0) {
            setBuffered(video.buffered.end(video.buffered.length - 1));
        }
        
        if (onProgress) {
            onProgress(video.currentTime, video.duration);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        const bar = progressRef.current;
        if (!video || !bar) return;
        const rect = bar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * duration;
    };

    const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = progressRef.current;
        if (!bar) return;
        const rect = bar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        setHoverTime(pos * duration);
        setHoverX(e.clientX - rect.left);
    };

    const handleSpeedChange = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeed(speed);
            setShowSpeedMenu(false);
        }
    };

    const skip = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
        }
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

    const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black group select-none"
            onMouseMove={resetHideTimer}
            onClick={(e) => {
                if ((e.target as HTMLElement).closest('button, input, [data-controls]')) return;
                togglePlay();
                resetHideTimer();
            }}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                    if (videoRef.current) {
                        setDuration(videoRef.current.duration);
                        if (initialTime && initialTime > 0 && initialTime < videoRef.current.duration - 5) {
                            videoRef.current.currentTime = initialTime;
                        }
                        setIsLoading(false);
                    }
                }}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={(e) => {
                    setIsLoading(false);
                    const vid = e.target as HTMLVideoElement;
                    if (vid.videoWidth === 0 && vid.duration > 0) {
                        setHasVideoCodecIssue(true);
                    }
                }}
                onPlaying={() => setIsLoading(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onError={(e) => {
                    setIsLoading(false);
                    if (onVideoError) {
                        onVideoError();
                        return;
                    }
                    const video = e.target as HTMLVideoElement;
                    const errorMsg = video.error ? `Error code: ${video.error.code} (${video.error.message})` : "Unknown playback error";
                    setErrorMessage(errorMsg);
                    console.error("Video Playback Error:", video.error);
                }}
                autoPlay
                playsInline
            />

            {/* Loading Spinner */}
            {isLoading && !errorMessage && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-red-600 rounded-full animate-spin" />
                </div>
            )}

            {/* Error Overlay */}
            {errorMessage && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 flex-col px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                        <span className="text-red-500 text-2xl">!</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Playback Error</h3>
                    <p className="text-gray-400 text-sm max-w-md">{errorMessage}</p>
                    <p className="text-gray-500 text-xs mt-4">The file may not be supported by your browser or the proxy stream failed.</p>
                </div>
            )}

            {/* HEVC Codec Warning */}
            {hasVideoCodecIssue && !errorMessage && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/70 flex-col px-4 text-center pointer-events-auto pb-12">
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                        <span className="text-orange-500 text-2xl font-bold">!</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Unsupported Video Codec (HEVC)</h3>
                    <p className="text-gray-300 text-sm max-w-md">Your browser can play the audio, but the video track is in HEVC (H.265) format which is not supported natively by most web browsers.</p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); window.open(`vlc://${src}`) }}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm"
                        >
                            <Play className="w-4 h-4 fill-white" /> Watch in VLC Player
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(src); alert('Stream URL copied to clipboard! Open VLC and paste it into "Open Network Stream"'); }}
                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm"
                        >
                            <Copy className="w-4 h-4" /> Copy Stream URL
                        </button>
                    </div>
                </div>
            )}

            {/* Center Play/Pause Flash */}
            {showCenterIcon && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-6 animate-ping-once">
                        {showCenterIcon === 'play' ? (
                            <Play className="w-12 h-12 text-white fill-white" />
                        ) : (
                            <Pause className="w-12 h-12 text-white fill-white" />
                        )}
                    </div>
                </div>
            )}

            {/* Top Gradient + Title */}
            <div className={`absolute top-0 left-0 right-0 z-30 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="bg-gradient-to-b from-black/80 via-black/30 to-transparent px-6 py-5 flex items-center gap-4">
                    <button
                        onClick={(e) => { e.stopPropagation(); router.back(); }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        data-controls
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

            {/* Bottom Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                data-controls
            >
                <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-4 px-4 md:px-6">
                    {/* Progress Bar */}
                    <div
                        ref={progressRef}
                        className="relative h-1.5 group/progress cursor-pointer mb-4 hover:h-3 transition-all duration-200"
                        onClick={(e) => { e.stopPropagation(); handleProgressClick(e); }}
                        onMouseMove={handleProgressHover}
                        onMouseLeave={() => setHoverTime(null)}
                    >
                        {/* Background */}
                        <div className="absolute inset-0 bg-white/20 rounded-full" />
                        {/* Buffered */}
                        <div
                            className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
                            style={{ width: `${bufferedProgress}%` }}
                        />
                        {/* Progress */}
                        <div
                            className="absolute inset-y-0 left-0 bg-red-600 rounded-full transition-none"
                            style={{ width: `${progress}%` }}
                        />
                        {/* Scrubber Dot */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full shadow-lg shadow-red-600/50 opacity-0 group-hover/progress:opacity-100 transition-opacity -ml-2"
                            style={{ left: `${progress}%` }}
                        />
                        {/* Hover Time Tooltip */}
                        {hoverTime !== null && (
                            <div
                                className="absolute -top-10 bg-black/90 text-white text-xs px-2.5 py-1 rounded-lg font-mono pointer-events-none border border-white/10"
                                style={{ left: `${hoverX}px`, transform: 'translateX(-50%)' }}
                            >
                                {formatTime(hoverTime)}
                            </div>
                        )}
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 md:gap-2">
                            {/* Play/Pause */}
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                {isPlaying ? <Pause className="w-6 h-6 text-white fill-white" /> : <Play className="w-6 h-6 text-white fill-white" />}
                            </button>

                            {/* Skip Back */}
                            <button
                                onClick={(e) => { e.stopPropagation(); skip(-10); }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block"
                            >
                                <SkipBack className="w-5 h-5 text-white" />
                            </button>

                            {/* Skip Forward */}
                            <button
                                onClick={(e) => { e.stopPropagation(); skip(10); }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block"
                            >
                                <SkipForward className="w-5 h-5 text-white" />
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-1 group/vol">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsMuted(m => !m); }}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <VolumeIcon className="w-5 h-5 text-white" />
                                </button>
                                <div className="w-0 group-hover/vol:w-24 overflow-hidden transition-all duration-300">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            setVolume(Number(e.target.value));
                                            setIsMuted(false);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full h-1 accent-red-600 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Time */}
                            <span className="text-white/80 text-xs md:text-sm font-mono ml-2 select-none">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 md:gap-2">
                            {/* Speed */}
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(s => !s); }}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1"
                                >
                                    <Settings className="w-5 h-5 text-white" />
                                    <span className="text-white text-xs font-medium hidden sm:inline">{playbackSpeed}x</span>
                                </button>
                                {showSpeedMenu && (
                                    <div
                                        className="absolute bottom-full right-0 mb-2 bg-[#1c1c1e]/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {speeds.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => handleSpeedChange(s)}
                                                className={`block w-full px-5 py-2.5 text-sm text-left hover:bg-white/10 transition-colors ${s === playbackSpeed ? 'text-red-500 font-bold bg-white/10' : 'text-white'}`}
                                            >
                                                {s}x
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* PiP */}
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePiP(); }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors hidden md:block"
                            >
                                <PictureInPicture2 className="w-5 h-5 text-white" />
                            </button>

                            {/* Fullscreen */}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                {isFullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
