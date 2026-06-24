'use client';

import { useState } from 'react';
import { SaveSlotSummary } from '@/lib/generation/types';
import { MAX_SAVE_SLOTS } from '@/lib/storage/indexeddb';
import { loadGame, deleteSave } from '@/lib/storage/indexeddb';
import { useGameStore } from '@/lib/buddy/store';

interface SaveSlotSelectionProps {
  slots: SaveSlotSummary[];
  onSelectSlot: (slot: number) => void;
  onNewGame: (slot: number) => void;
}

export function SaveSlotSelection({ slots, onSelectSlot, onNewGame }: SaveSlotSelectionProps) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const formatTime = (ms: number) => {
    if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 lcd-screen">
      <h1 className="font-lcd text-xl lcd-text-accent mb-6">SELECT SAVE SLOT</h1>
      <div className="w-full max-w-md space-y-3">
        {slots.map(slot => (
          <div key={slot.slot} className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lcd-text opacity-50 uppercase tracking-wider">Slot {slot.slot}</span>
              {confirmDelete === slot.slot ? (
                <div className="flex gap-1">
                  <button onClick={() => { deleteSave(slot.slot); setConfirmDelete(null); }} className="text-[10px] px-2 py-1 bg-red-900/30 text-red-300 rounded focus-ring">YES</button>
                  <button onClick={() => setConfirmDelete(null)} className="text-[10px] px-2 py-1 bg-[#1a1a2e] text-lcd-text rounded focus-ring">NO</button>
                </div>
              ) : slot.buddy ? (
                <button onClick={() => setConfirmDelete(slot.slot)} className="text-[10px] px-2 py-1 bg-[#1a1a2e] text-lcd-warn rounded focus-ring">DELETE</button>
              ) : null}
            </div>
            {slot.buddy ? (
              <div className="space-y-1">
                <p className="lcd-text-accent font-lcd">{slot.buddyName}</p>
                <p className="text-xs lcd-text opacity-60">{slot.buddySpecies} <span className={`rarity-${slot.buddyRarity}`}>{slot.buddyRarity.toUpperCase()}</span>{slot.buddyShiny && ' ✦'}</p>
                <p className="text-[10px] lcd-text opacity-40">Last played: {new Date(slot.updatedAt).toLocaleDateString()} · {formatTime(slot.playTime || 0)}</p>
              </div>
            ) : (
              <p className="text-xs lcd-text opacity-40">Empty slot</p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => slot.buddy ? onSelectSlot(slot.slot) : onNewGame(slot.slot)}
                className={`btn-device flex-1 py-2 text-sm rounded-md focus-ring ${slot.buddy ? 'bg-lcd-accent text-black' : 'bg-[#1a1a2e] lcd-text'}`}
              >
                {slot.buddy ? 'CONTINUE' : 'NEW GAME'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] lcd-text opacity-30 mt-6 text-center">Up to {MAX_SAVE_SLOTS} buddies per device</p>
    </div>
  );
}