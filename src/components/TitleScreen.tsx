'use client';

interface TitleScreenProps {
  onStart: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <h1 className="text-6xl font-bold text-cyan-400 mb-4 tracking-wider">
        RESCUE
      </h1>
      <p className="text-gray-400 mb-8 text-center max-w-md px-4">
        Defend humans from alien Landers.
        <br />
        Destroy aliens before they abduct everyone.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xl font-bold rounded-lg transition-colors"
      >
        START GAME
      </button>
      <div className="mt-8 text-gray-500 text-sm space-y-1 text-center">
        <div>Arrow Keys or WASD: Move</div>
        <div>Space: Fire</div>
      </div>
    </div>
  );
}
