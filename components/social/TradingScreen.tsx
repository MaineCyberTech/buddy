'use client';

import { useState } from 'react';
import { TradeOffer, initTradeState, createTradeOffer, acceptTradeOffer, declineTradeOffer } from '@/lib/social';
import { useGameStore } from '@/lib/buddy/store';

interface TradingScreenProps {
  onBack: () => void;
}

export function TradingScreen({ onBack }: TradingScreenProps) {
  const buddy = useGameStore(s => s.buddy);
  const inventory = useGameStore(s => s.inventory);
  const [offers, setOffers] = useState<TradeOffer[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [requestedItem, setRequestedItem] = useState('');

  const handleCreateOffer = () => {
    if (!buddy || !selectedItem) return;
    const newOffers = createTradeOffer(
      offers, 'local', 'You', buddy.identity.speciesId,
      [{ itemId: selectedItem, quantity: 1 }],
      requestedItem ? [{ itemId: requestedItem, quantity: 1 }] : [],
    );
    setOffers(newOffers);
    setSelectedItem('');
    setRequestedItem('');
  };

  return (
    <div className="animate-fade-in space-y-3">
      <p className="text-xs lcd-text-accent uppercase tracking-wider">Trading (Local)</p>
      <div className="bg-lcd-dark rounded-sm p-2 space-y-1.5">
        <p className="text-[10px] lcd-text opacity-50">Create Offer</p>
        <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)} className="w-full bg-[#1a1a2e] text-xs lcd-text-accent p-1.5 rounded focus-ring">
          <option value="">Select item to offer...</option>
          {inventory.items.map(i => <option key={i.id} value={i.id}>{i.id} (×{i.quantity})</option>)}
        </select>
        <select value={requestedItem} onChange={e => setRequestedItem(e.target.value)} className="w-full bg-[#1a1a2e] text-xs lcd-text-accent p-1.5 rounded focus-ring">
          <option value="">Request item... (optional)</option>
          {inventory.items.filter(i => i.id !== selectedItem).map(i => <option key={i.id} value={i.id}>{i.id} (×{i.quantity})</option>)}
        </select>
        <button onClick={handleCreateOffer} disabled={!selectedItem} className="btn-device px-3 py-1.5 text-xs rounded-md focus-ring w-full">CREATE OFFER</button>
      </div>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        <p className="text-[10px] lcd-text opacity-50 uppercase">Active Offers ({offers.filter(o => o.status === 'pending').length})</p>
        {offers.filter(o => o.status === 'pending').map(offer => (
          <div key={offer.id} className="bg-lcd-dark rounded-sm p-1.5 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] lcd-text-accent">{offer.fromUsername}</p>
              <p className="text-[9px] lcd-text opacity-50">Offers: {offer.offeredItems.map(i => `${i.itemId}×${i.quantity}`).join(', ')}</p>
              {offer.requestedItems.length > 0 && <p className="text-[9px] lcd-text opacity-50">Wants: {offer.requestedItems.map(i => `${i.itemId}×${i.quantity}`).join(', ')}</p>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setOffers(acceptTradeOffer(offers, offer.id))} className="text-[10px] px-2 py-1 rounded focus-ring lcd-text-accent">✓</button>
              <button onClick={() => setOffers(declineTradeOffer(offers, offer.id))} className="text-[10px] px-2 py-1 rounded focus-ring lcd-text-warn">✕</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">BACK</button>
    </div>
  );
}
