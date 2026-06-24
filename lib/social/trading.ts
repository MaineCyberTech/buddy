export interface TradeOffer {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromBuddyId: string;
  offeredItems: { itemId: string; quantity: number }[];
  requestedItems: { itemId: string; quantity: number }[];
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: number;
}

export interface TradeState {
  activeOffers: TradeOffer[];
  completedTrades: number;
}

export function initTradeState(): TradeState {
  return { activeOffers: [], completedTrades: 0 };
}

export function createTradeOffer(
  offers: TradeOffer[],
  fromUserId: string,
  fromUsername: string,
  fromBuddyId: string,
  offeredItems: { itemId: string; quantity: number }[],
  requestedItems: { itemId: string; quantity: number }[],
): TradeOffer[] {
  const offer: TradeOffer = {
    id: 'trade-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    fromUserId,
    fromUsername,
    fromBuddyId,
    offeredItems,
    requestedItems,
    status: 'pending',
    createdAt: Date.now(),
  };
  return [...offers, offer];
}

export function acceptTradeOffer(offers: TradeOffer[], offerId: string): TradeOffer[] {
  return offers.map(o => o.id === offerId ? { ...o, status: 'accepted' as const } : o);
}

export function declineTradeOffer(offers: TradeOffer[], offerId: string): TradeOffer[] {
  return offers.map(o => o.id === offerId ? { ...o, status: 'declined' as const } : o);
}

export function cancelTradeOffer(offers: TradeOffer[], offerId: string): TradeOffer[] {
  return offers.map(o => o.id === offerId ? { ...o, status: 'cancelled' as const } : o);
}
