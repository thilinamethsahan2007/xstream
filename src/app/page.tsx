'use client';

import Navbar from '@/components/layout/Navbar';
import MovieModal from '@/components/modal/MovieModal';
import ImmersiveCarousel from '@/components/home/ImmersiveCarousel';
import ContinueWatchingRow from '@/components/home/ContinueWatchingRow';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black">
      <Navbar />
      <ImmersiveCarousel />
      
      <div className="relative z-10 px-4 md:px-8 pb-20 -mt-24 pt-8 bg-gradient-to-t from-black via-black to-transparent">
          <ContinueWatchingRow />
      </div>

      <MovieModal />
    </main>
  );
}
