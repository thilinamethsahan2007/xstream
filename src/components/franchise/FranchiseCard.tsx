import Link from 'next/link';
import { Franchise } from '@/lib/franchises';
import { getImageUrl } from '@/lib/utils';

interface FranchiseCardProps {
    franchise: Franchise & { isCustom?: boolean };
}

export default function FranchiseCard({ franchise }: FranchiseCardProps) {
    const href = franchise.isCustom
        ? `/franchises/search?q=${encodeURIComponent(franchise.name)}`
        : `/franchises/${franchise.id}`;

    return (
        <Link href={href} className="group relative block aspect-video overflow-hidden rounded-xl bg-white/5 backdrop-blur-md border border-white/5 shadow-2xl shadow-black/50 hover:shadow-white/10 transition-all duration-500">
            <img
                src={getImageUrl(franchise.backdropPath, 'w500')}
                alt={franchise.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white drop-shadow-md tracking-tight transform transition-transform duration-300 group-hover:-translate-y-1">{franchise.name}</h3>
                {franchise.updatedAt && (
                    <p className="text-xs text-label-secondary mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        Updated: {new Date(franchise.updatedAt).toLocaleDateString()}
                    </p>
                )}
            </div>
        </Link>
    );
}
