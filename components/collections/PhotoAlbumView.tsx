'use client';

import { PhotoEntry } from '@/lib/collections';

interface PhotoAlbumViewProps {
  photos: PhotoEntry[];
  onBack: () => void;
  onDeletePhoto?: (id: string) => void;
}

export function PhotoAlbumView({ photos, onBack, onDeletePhoto }: PhotoAlbumViewProps) {
  return (
    <div className="animate-fade-in space-y-3">
      <p className="text-xs lcd-text-accent uppercase tracking-wider">Photo Album</p>
      {photos.length === 0 ? (
        <p className="text-xs lcd-text opacity-50 italic">No photos yet. Photos are saved when you take snapshots of your buddy.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {photos.map(photo => (
            <div key={photo.id} className="bg-lcd-dark rounded-sm p-2 flex items-start gap-2">
              <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">{photo.isShiny ? '✨' : '📸'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs lcd-text-accent">{photo.nickname}</p>
                <p className="text-[10px] lcd-text opacity-60">{photo.speciesName} — {photo.stage} stage</p>
                <p className="text-[9px] lcd-text opacity-40">
                  <span className={`rarity-${photo.rarity}`}>{photo.rarity.toUpperCase()}</span>
                  {photo.isShiny && <span className="rarity-shiny ml-1">✦ SHINY</span>}
                  {photo.location && <span className="ml-1">📍 {photo.location}</span>}
                </p>
                <p className="text-[9px] lcd-text opacity-30">{new Date(photo.timestamp).toLocaleDateString()}</p>
              </div>
              {onDeletePhoto && (
                <button onClick={() => onDeletePhoto(photo.id)} className="text-xs lcd-text-warn opacity-60 hover:opacity-100 focus-ring px-1" aria-label="Delete photo">✕</button>
              )}
            </div>
          ))}
        </div>
      )}
      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">BACK</button>
    </div>
  );
}
