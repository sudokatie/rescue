'use client';

import { GameCanvas } from '@/components/GameCanvas';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center">
      <GameCanvas />
    </main>
  );
}
