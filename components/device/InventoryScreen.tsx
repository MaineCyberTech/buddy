'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/buddy/store';
import { ITEM_MAP } from '@/data/items';
import { applyItemAction, ItemActionType } from '@/lib/actions/care';

interface InventoryScreenProps {
  onBack: () => void;
}

const USABLE_CATEGORIES = ['food', 'medicine', 'toy', 'skill_book'];

export function InventoryScreen({ onBack }: InventoryScreenProps) {
  const inventory = useGameStore((s) => s.inventory);
  const buddy = useGameStore((s) => s.buddy);
  const setBuddy = useGameStore((s) => s.setBuddy);
  const setInventory = useGameStore((s) => s.setInventory);
  const [message, setMessage] = useState('');

  const itemCount = inventory.items.reduce((sum, i) => sum + i.quantity, 0);

  const handleItemAction = (itemId: string, action: ItemActionType) => {
    if (!buddy) return;
    const outcome = applyItemAction(buddy, inventory, itemId, action);
    setMessage(outcome.message);
    if (!outcome.success) return;
    setBuddy(outcome.buddy);
    setInventory(outcome.inventory);
  };

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs lcd-text-accent uppercase tracking-wider">Inventory</p>
        <p className="text-xs lcd-text-accent">🪙 {inventory.coins}</p>
      </div>

      {message && (
        <p className="text-xs lcd-text-accent" role="status" aria-live="polite">
          {message}
        </p>
      )}

      {itemCount === 0 ? (
        <p className="text-xs lcd-text opacity-50 italic">No items yet. Go on adventures to find treasures!</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {inventory.items.map((entry) => {
            const def = ITEM_MAP.get(entry.id);
            if (!def) return null;
            const canUse = USABLE_CATEGORIES.includes(def.category);
            const canEquip = def.category === 'hat';
            const canSell = def.sellValue > 0;
            return (
              <div key={entry.id} className="flex items-center justify-between px-2 py-1 bg-lcd-dark rounded-sm gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span aria-hidden="true">{def.icon}</span>
                  <span className="text-xs lcd-text truncate">{def.name}</span>
                  <span className="text-xs lcd-text opacity-60">x{entry.quantity}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {canUse && (
                    <button
                      onClick={() => handleItemAction(entry.id, 'use')}
                      className="btn-device px-2 py-0.5 text-[10px] rounded focus-ring"
                      aria-label={`Use ${def.name}`}
                    >
                      USE
                    </button>
                  )}
                  {canEquip && (
                    <button
                      onClick={() => handleItemAction(entry.id, 'equip')}
                      className="btn-device px-2 py-0.5 text-[10px] rounded focus-ring"
                      aria-label={`Equip ${def.name}`}
                    >
                      EQUIP
                    </button>
                  )}
                  {canSell && (
                    <button
                      onClick={() => handleItemAction(entry.id, 'sell')}
                      className="btn-device px-2 py-0.5 text-[10px] rounded focus-ring"
                      aria-label={`Sell ${def.name} for ${def.sellValue} coins`}
                    >
                      SELL {def.sellValue}
                    </button>
                  )}
                </div>
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
