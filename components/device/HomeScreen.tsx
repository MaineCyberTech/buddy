'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/buddy/store';
import { HOME_SLOTS, DecorPlacement, ItemDefinition } from '@/lib/generation/types';
import { ITEM_MAP, DECOR_ITEMS } from '@/data/items';

interface HomeScreenProps {
  onBack: () => void;
}

type HomeView = 'browse' | 'selecting' | 'preview';

export function HomeScreen({ onBack }: HomeScreenProps) {
  const placedDecor = useGameStore((s) => s.placedDecor);
  const inventory = useGameStore((s) => s.inventory);
  const placeDecor = useGameStore((s) => s.placeDecor);
  const guestId = useGameStore((s) => s.guestId);
  const isGuest = guestId.startsWith('guest-');

  const [view, setView] = useState<HomeView>('browse');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);

  const placementMap = new Map(placedDecor.map(p => [p.slotId, p]));

  const getDecorItem = (itemId: string | null): ItemDefinition | undefined => {
    if (!itemId) return undefined;
    return ITEM_MAP.get(itemId);
  };

  const availableDecor = inventory.items
    .filter(entry => {
      const def = ITEM_MAP.get(entry.id);
      return def && def.category === 'decor';
    })
    .filter(entry => entry.quantity > 0);

  const handleSlotClick = (slotId: string) => {
    const slot = HOME_SLOTS.find(s => s.id === slotId);
    if (!slot) return;
    if (slot.locked) {
      setMessage('Create an account to unlock this slot!');
      setMessageKey(k => k + 1);
      return;
    }
    setSelectedSlot(slotId);
    setView('selecting');
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedSlot(selectedSlot);
    setView('preview');
    setSelectedItem(itemId);
  };

  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleApply = () => {
    if (!selectedSlot || !selectedItem) return;
    placeDecor(selectedSlot, selectedItem);
    setMessage('Decor placed!');
    setMessageKey(k => k + 1);
    setView('browse');
    setSelectedSlot(null);
    setSelectedItem(null);
  };

  const handleRemove = (slotId: string) => {
    placeDecor(slotId, null);
    setMessage('Decor removed.');
    setMessageKey(k => k + 1);
  };

  const handleCancel = () => {
    setView('browse');
    setSelectedSlot(null);
    setSelectedItem(null);
  };

  if (view === 'selecting' && selectedSlot) {
    const slot = HOME_SLOTS.find(s => s.id === selectedSlot);
    const current = placementMap.get(selectedSlot);
    const slotDecor = availableDecor.filter(entry => {
      const def = ITEM_MAP.get(entry.id);
      return def && def.placementSlot === selectedSlot;
    });

    return (
      <div className="animate-fade-in space-y-3">
        <p className="text-xs lcd-text-accent uppercase tracking-wider">Place in {slot?.name}</p>
        {current?.itemId && (
          <p className="text-xs lcd-text opacity-60">
            Currently: {getDecorItem(current.itemId)?.icon} {getDecorItem(current.itemId)?.name}
          </p>
        )}
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {slotDecor.length === 0 ? (
            <p className="text-xs lcd-text opacity-50 italic">No decor items for this slot. Go on adventures to find some!</p>
          ) : (
            slotDecor.map((entry) => {
              const def = ITEM_MAP.get(entry.id);
              if (!def) return null;
              return (
                <button
                  key={entry.id}
                  onClick={() => { setSelectedItem(entry.id); setView('preview'); }}
                  className="w-full flex items-center justify-between px-2 py-1.5 bg-lcd-dark rounded-sm hover:opacity-80 transition-opacity focus-ring"
                  disabled={entry.id === current?.itemId}
                >
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true">{def.icon}</span>
                    <span className="text-xs lcd-text">{def.name}</span>
                  </div>
                  <span className="text-xs lcd-text opacity-60">x{entry.quantity}</span>
                </button>
              );
            })
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={handleCancel} className="btn-device px-3 py-2 text-xs rounded-md focus-ring">
            BACK
          </button>
          {current?.itemId && (
            <button
              onClick={() => { handleRemove(selectedSlot); setView('browse'); setSelectedItem(null); }}
              className="btn-device px-3 py-2 text-xs rounded-md focus-ring lcd-text-warn"
            >
              REMOVE
            </button>
          )}
        </div>
      </div>
    );
  }

  if (view === 'preview' && selectedSlot && selectedItem) {
    const def = ITEM_MAP.get(selectedItem);
    const slot = HOME_SLOTS.find(s => s.id === selectedSlot);
    if (!def || !slot) return null;

    return (
      <div className="animate-fade-in space-y-3 text-center">
        <p className="text-xs lcd-text-accent uppercase tracking-wider">Preview</p>
        <div className="bg-lcd-dark rounded-lg p-4 mx-auto max-w-[200px]">
          <div className="text-4xl mb-2">{def.icon}</div>
          <p className="text-sm lcd-text-accent font-lcd">{def.name}</p>
          <p className="text-xs lcd-text opacity-60 mt-1">{def.description}</p>
          <p className="text-xs lcd-text opacity-50 italic mt-1">"{def.flavorText}"</p>
          <p className="text-xs lcd-text opacity-60 mt-2">Placed in: {slot.name}</p>
          <p className={`text-xs mt-1 rarity-${def.rarity}`}>{def.rarity.toUpperCase()}</p>
        </div>
        {isGuest && (
          <p className="text-xs lcd-text-warn italic">Placement saves locally. Create an account for cloud persistence.</p>
        )}
        <div className="flex gap-2 justify-center">
          <button onClick={handleCancel} className="btn-device px-3 py-2 text-xs rounded-md focus-ring">
            CANCEL
          </button>
          <button onClick={handleApply} className="btn-device px-3 py-2 text-xs rounded-md focus-ring lcd-text-accent">
            PLACE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs lcd-text-accent uppercase tracking-wider">Home Decor</p>
        {message && (
          <span key={messageKey} className="text-xs lcd-text-accent animate-fade-in" role="status">{message}</span>
        )}
      </div>

      <div className="space-y-2">
        {HOME_SLOTS.map((slot) => {
          const placement = placementMap.get(slot.id);
          const item = placement?.itemId ? ITEM_MAP.get(placement.itemId) : undefined;

          return (
            <div key={slot.id} className="flex items-center justify-between px-2 py-1.5 bg-lcd-dark rounded-sm">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {slot.locked ? (
                  <span className="text-xs lcd-text-warn" aria-label="Locked">🔒</span>
                ) : (
                  <span className="text-xs lcd-text opacity-40">□</span>
                )}
                <span className={`text-xs lcd-text ${slot.locked ? 'opacity-40' : ''}`}>{slot.name}</span>
                {item && (
                  <span className="text-xs lcd-text opacity-80 ml-1">{item.icon} {item.name}</span>
                )}
                {!item && !slot.locked && (
                  <span className="text-xs lcd-text opacity-30 italic ml-1">Empty</span>
                )}
                {slot.locked && (
                  <span className="text-xs lcd-text-warn opacity-70 italic ml-2">Account only</span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                {!slot.locked && (
                  <button
                    onClick={() => handleSlotClick(slot.id)}
                    className="text-[10px] px-2 py-0.5 rounded btn-device focus-ring"
                    aria-label={item ? 'Replace decor' : 'Place decor'}
                  >
                    {item ? 'CHANGE' : 'PLACE'}
                  </button>
                )}
                {item && !slot.locked && (
                  <button
                    onClick={() => handleRemove(slot.id)}
                    className="text-[10px] px-2 py-0.5 rounded btn-device focus-ring lcd-text-warn"
                    aria-label="Remove decor"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[10px] lcd-text opacity-50">
        <span>🪙 {inventory.coins}</span>
        <span>|</span>
        <span>{inventory.items.filter(i => ITEM_MAP.get(i.id)?.category === 'decor').reduce((s, i) => s + i.quantity, 0)} decor items</span>
      </div>

      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring mt-2">
        BACK
      </button>
    </div>
  );
}
