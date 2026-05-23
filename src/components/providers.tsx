'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, Suspense } from 'react';
import TelegramModal from '@/components/modal/TelegramModal';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Suspense fallback={null}>
                <TelegramModal />
            </Suspense>
        </QueryClientProvider>
    );
}
