'use client';

import { useGameStore } from '@/lib/buddy/store';
import { ITEM_MAP } from '@/data/items';

interface InventoryScreenProps {
  onBack: () => void;
}

export function InventoryScreen({ onBack }: InventoryScreenProps) {
  const inventory = useGameStore((s) => s.inventory);

  const itemCount = inventory.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs lcd-text-accent uppercase tracking-wider">Inventory</p>
        <p className="text-xs lcd-text-accent">🪙 {inventory.coins}</p>
      </div>

      {itemCount === 0 ? (
        <p className="text-xs lcd-text opacity-50 italic">No items yet. Go on adventures to find treasures!</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {inventory.items.map((entry) => {
            const def = ITEM_MAP.get(entry.id);
            if (!def) return null;
            return (
              <div key={entry.id} className="flex items-center justify-between px-2 py-1 bg-lcd-dark rounded-sm">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">{def.icon}</span>
                  <span className="text-xs lcd-text">{def.name}</span>
                </div>
                <span className="text-xs lcd-text opacity-60">x{entry.quantity}</span>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onBack}
        className="btn-device px-4 py-2 text-xs rounded-md focus-ring mt-2"
      >
        BACK
      </button>
    </div>
  );
}