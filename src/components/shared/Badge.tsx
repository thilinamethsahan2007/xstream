import { cn } from "@/lib/utils";

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'red' | 'orange' | 'green' | 'blue' | 'glass' | 'default';
    className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
    const variants = {
        red: "bg-red-500/90 text-white shadow-red-500/20",
        orange: "bg-orange-500/90 text-white shadow-orange-500/20",
        green: "bg-green-500/90 text-white shadow-green-500/20",
        blue: "bg-[#0a84ff] text-white shadow-blue-500/30",
        glass: "bg-white/10 backdrop-blur-md text-white border border-white/10",
        default: "bg-gray-700/80 text-white backdrop-blur-sm"
    };

    return (
        <span className={cn(
            "text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
}
