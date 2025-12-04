import { FranchiseContent } from '@/hooks/useFranchise';
import { getImageUrl } from '@/lib/utils';
import { useModalStore } from '@/store/modalStore';
import { motion } from 'framer-motion';

interface TimelineProps {
    content: FranchiseContent[];
}

export default function Timeline({ content }: TimelineProps) {
    const openModal = useModalStore((state) => state.openModal);

    return (
        <div className="relative container mx-auto px-4 py-16">
            {/* Vertical Line with Gradient */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-blue-500/30 to-transparent -translate-x-1/2 md:translate-x-0" />

            <div className="space-y-16">
                {content.map((item, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <motion.div
                            key={`${item.id}-${index}`}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                            className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''}`}
                        >
                            {/* Date Marker with Glow */}
                            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                <div className="absolute w-6 h-6 bg-blue-500/20 rounded-full animate-pulse" />
                            </div>

                            {/* Content Spacer */}
                            <div className="flex-1 w-full md:w-1/2" />

                            {/* Content Card */}
                            <div className={`flex-1 w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                                <div
                                    className="group relative material-regular rounded-2xl overflow-hidden hover:border-system-blue/30 transition-all duration-500 hover:shadow-2xl hover:shadow-system-blue/10 cursor-pointer"
                                    onClick={() => openModal(item as any)}
                                >
                                    <div className="flex h-40 sm:h-48">
                                        <div className="w-28 sm:w-36 shrink-0 relative overflow-hidden">
                                            <img
                                                src={getImageUrl(item.poster_path, 'w500')}
                                                alt={item.title}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                                        </div>
                                        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center relative overflow-hidden">
                                            {/* Background Glow Effect */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-system-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-system-blue text-lg font-bold font-mono tracking-tight">
                                                        {item.release_date ? new Date(item.release_date).getFullYear() : 'TBA'}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-label-primary/10 text-label-secondary border border-label-primary/5">
                                                        {item.media_type === 'movie' ? 'MOVIE' : 'TV SERIES'}
                                                    </span>
                                                    {item.media_type === 'tv' && item.number_of_seasons && (
                                                        <span className="text-[10px] text-label-secondary font-mono">
                                                            {item.number_of_seasons} S • {item.number_of_episodes} E
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-label-primary font-bold text-xl sm:text-2xl mb-2 leading-tight tracking-tight group-hover:text-system-blue transition-colors line-clamp-2">
                                                    {item.title}
                                                </h3>

                                                <p className="text-label-secondary text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium">
                                                    {item.overview}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
