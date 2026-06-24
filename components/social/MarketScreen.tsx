'use client';

import { useState, useMemo } from 'react';
import { generateDailyStock, getSellPrice, MarketListing } from '@/lib/social';
import { ITEM_MAP } from '@/data/items';
import { useGameStore } from '@/lib/buddy/store';
import { SoundEngine } from '@/lib/sound';

interface MarketScreenProps {
  onBack: () => void;
}

export function MarketScreen({ onBack }: MarketScreenProps) {
  const inventory = useGameStore(s => s.inventory);
  const addItem = useGameStore(s => s.addItem);
  const addCoins = useGameStore(s => s.addCoins);
  const removeItem = useGameStore(s => s.removeItem);
  const [listings] = useState<MarketListing[]>(() => generateDailyStock());
  const [message, setMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');

  const sellableItems = useMemo(() =>
    inventory.items.filter(i => ITEM_MAP.has(i.id)),
  [inventory.items]);

  const handleBuy = (listing: MarketListing) => {
    if (inventory.coins < listing.buyPrice) {
      setMessage('Not enough coins!');
      setMessageKey(k => k + 1);
      return;
    }
    if (listing.stock <= 0) {
      setMessage('Out of stock!');
      setMessageKey(k => k + 1);
      return;
    }
    addCoins(-listing.buyPrice);
    addItem(listing.itemId, 1);
    listing.stock--;
    SoundEngine.coin();
    setMessage(`Bought ${ITEM_MAP.get(listing.itemId)?.name || listing.itemId}!`);
    setMessageKey(k => k + 1);
  };

  const handleSell = (itemId: string) => {
    const price = getSellPrice(itemId);
    removeItem(itemId, 1);
    addCoins(price);
    SoundEngine.coin();
    setMessage(`Sold ${ITEM_MAP.get(itemId)?.name || itemId} for ${price} coins`);
    setMessageKey(k => k + 1);
  };

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs lcd-text-accent uppercase tracking-wider">Marketplace</p>
        <p className="text-xs lcd-text opacity-60">Coins: {inventory.coins}</p>
      </div>
      <div className="flex gap-1">
        <button onClick={() => setTab('buy')} className={`text-[10px] px-3 py-1 rounded focus-ring ${tab === 'buy' ? 'bg-lcd-accent text-black' : 'bg-[#1a1a2e] lcd-text opacity-70'}`}>BUY</button>
        <button onClick={() => setTab('sell')} className={`text-[10px] px-3 py-1 rounded focus-ring ${tab === 'sell' ? 'bg-lcd-accent text-black' : 'bg-[#1a1a2e] lcd-text opacity-70'}`}>SELL</button>
      </div>
      {message && <p key={messageKey} className="text-xs lcd-text-accent animate-fade-in">{message}</p>}

      {tab === 'buy' && (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {listings.map(l => {
            const def = ITEM_MAP.get(l.itemId);
            if (!def) return null;
            return (
              <div key={l.itemId} className="bg-lcd-dark rounded-sm p-2 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs lcd-text-accent">{def.icon} {def.name}</p>
                  <p className="text-[9px] lcd-text opacity-50"><span className={`rarity-${def.rarity}`}>{def.rarity}</span> — {def.description}</p>
                  <p className="text-[9px] lcd-text opacity-40">Stock: {l.stock} | Price: {l.buyPrice} coins</p>
                </div>
                <button onClick={() => handleBuy(l)} disabled={l.stock <= 0 || inventory.coins < l.buyPrice} className="btn-device px-2 py-1 text-[10px] rounded focus-ring shrink-0">BUY</button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'sell' && (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {sellableItems.length === 0 ? (
            <p className="text-xs lcd-text opacity-50 italic">No items to sell.</p>
          ) : sellableItems.map(item => {
            const def = ITEM_MAP.get(item.id);
            if (!def) return null;
            const price = getSellPrice(item.id);
            return (
              <div key={item.id} className="bg-lcd-dark rounded-sm p-2 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs lcd-text-accent">{def.icon} {def.name} ×{item.quantity}</p>
                  <p className="text-[9px] lcd-text opacity-50"><span className={`rarity-${def.rarity}`}>{def.rarity}</span> — Sell: {price} coins each</p>
                </div>
                <button onClick={() => handleSell(item.id)} className="btn-device px-2 py-1 text-[10px] rounded focus-ring shrink-0">SELL</button>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">BACK</button>
    </div>
  );
}