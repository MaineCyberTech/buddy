export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  exclusiveItems: string[];
  active: boolean;
}

const EVENTS: SeasonalEvent[] = [
  { id: 'spring_bloom', name: 'Spring Bloom', description: 'Flowers bloom everywhere! Find special spring seeds in adventures.', startDate: '2026-03-20', endDate: '2026-06-20', exclusiveItems: ['spring_flower', 'rainbow_egg'], active: false },
  { id: 'summer_fest', name: 'Summer Festival', description: 'Fireworks and fun! Earn double coins from adventures.', startDate: '2026-06-21', endDate: '2026-09-22', exclusiveItems: ['firework_sparkler', 'summer_hat'], active: false },
  { id: 'harvest_moon', name: 'Harvest Moon Festival', description: 'Special harvest items can be found while exploring.', startDate: '2026-09-23', endDate: '2026-12-20', exclusiveItems: ['pumpkin_lantern', 'autumn_wreath'], active: false },
  { id: 'winter_wonder', name: 'Winter Wonderland', description: 'Snowy adventures with exclusive winter decor.', startDate: '2026-12-21', endDate: '2027-03-19', exclusiveItems: ['snowflake_ornament', 'ice_crown'], active: false },
];

export function getSeasonalEvents(): SeasonalEvent[] {
  const now = Date.now();
  return EVENTS.map(e => {
    const start = new Date(e.startDate).getTime();
    const end = new Date(e.endDate).getTime();
    return { ...e, active: now >= start && now <= end };
  });
}

export function getActiveEvents(): SeasonalEvent[] {
  return getSeasonalEvents().filter(e => e.active);
}

export function isEventActive(eventId: string): boolean {
  return getSeasonalEvents().some(e => e.id === eventId && e.active);
}
