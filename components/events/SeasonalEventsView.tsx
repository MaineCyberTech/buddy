'use client';

import { getSeasonalEvents } from '@/lib/events';

interface SeasonalEventsViewProps {
  onBack: () => void;
}

export function SeasonalEventsView({ onBack }: SeasonalEventsViewProps) {
  const events = getSeasonalEvents();

  return (
    <div className="animate-fade-in space-y-3">
      <p className="text-xs lcd-text-accent uppercase tracking-wider">Seasonal Events</p>
      {events.length === 0 ? (
        <p className="text-xs lcd-text opacity-50 italic">No seasonal events scheduled.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {events.map(event => {
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            const now = Date.now();
            const isActive = event.active;
            const daysUntil = Math.ceil((start.getTime() - now) / 86400000);
            return (
              <div key={event.id} className={`rounded-sm p-2 ${isActive ? 'bg-lcd-dark border border-lcd-accent' : 'bg-[#1a1a2e] opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${isActive ? 'lcd-text-accent' : 'lcd-text opacity-50'}`}>{event.name}</p>
                  {isActive && <span className="text-[9px] lcd-text-accent">● ACTIVE</span>}
                </div>
                <p className="text-[10px] lcd-text opacity-60 mt-0.5">{event.description}</p>
                <p className="text-[9px] lcd-text opacity-40 mt-0.5">
                  {isActive ? `Ends ${end.toLocaleDateString()}` : daysUntil > 0 ? `Starts in ${daysUntil} days` : 'Ended'}
                </p>
                {event.exclusiveItems.length > 0 && (
                  <p className="text-[9px] lcd-text opacity-40 mt-0.5">Exclusive items: {event.exclusiveItems.join(', ')}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">BACK</button>
    </div>
  );
}
