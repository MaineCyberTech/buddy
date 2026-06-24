'use client';

import { useGameStore } from '@/lib/buddy/store';

interface MemoryAlbumProps {
  onBack: () => void;
}

export function MemoryAlbum({ onBack }: MemoryAlbumProps) {
  const buddy = useGameStore(s => s.buddy);
  const memories = buddy?.progression?.memories || [];

  const typeIcons: Record<string, string> = {
    hatch: '🥚',
    evolution: '✨',
    adventure: '🗺️',
    milestone: '🏆',
    achievement: '⭐',
  };

  return (
    <div className="animate-fade-in space-y-3">
      <p className="text-xs lcd-text-accent uppercase tracking-wider">Memory Album</p>

      {memories.length === 0 ? (
        <p className="text-xs lcd-text opacity-50 italic">No memories yet. Go on adventures and milestones will be recorded.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {[...memories].reverse().map((mem) => (
            <div key={mem.id} className="bg-lcd-dark rounded-sm p-2 flex items-start gap-2">
              <span className="text-base shrink-0 mt-0.5" aria-hidden="true">{typeIcons[mem.type] || '📝'}</span>
              <div className="min-w-0">
                <p className="text-xs lcd-text-accent">{mem.title}</p>
                <p className="text-[10px] lcd-text opacity-60">{mem.description}</p>
                <p className="text-[9px] lcd-text opacity-40 mt-0.5">
                  {new Date(mem.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring mt-2">
        BACK
      </button>
    </div>
  );
}
