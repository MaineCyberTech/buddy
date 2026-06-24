// Buddy Adventure Validator Edge Function
// Deploy to Supabase Edge Functions: supabase functions deploy adventure-validator

interface AdventureRequest {
  buddyId: string;
  locationId: string;
  clientTimestamp: number;
  buddySeed: string;
  statSnapshot: Record<string, number>;
  needsSnapshot: Record<string, number>;
}

interface AdventureResponse {
  success: boolean;
  message: string;
  statChecks: Record<string, { required: number; actual: number; passed: boolean }>;
  xpReward: number;
  bondReward: number;
  coinReward: number;
  itemRewards: { itemId: string; quantity: number }[];
  statChanges: Record<string, number>;
  needsChanges: Record<string, number>;
}

const LOCATIONS: Record<string, { statChecks: Record<string, number>; energyCost: number }> = {
  'sunny_meadow': { statChecks: { curiosity: 10 }, energyCost: 10 },
  'mystic_forest': { statChecks: { courage: 15, curiosity: 10 }, energyCost: 15 },
  'crystal_cave': { statChecks: { courage: 20, discipline: 15 }, energyCost: 20 },
  'starlit_peak': { statChecks: { playfulness: 25, discipline: 20 }, energyCost: 25 },
};

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash % 10000) / 10000;
}

function generateLoot(seed: string, locationId: string): { itemId: string; quantity: number }[] {
  const rng = seededRandom(seed + locationId);
  const items: { itemId: string; quantity: number }[] = [];

  if (rng > 0.5) {
    items.push({
      itemId: locationId === 'crystal_cave' ? 'crystal_shard' : 'basic_material',
      quantity: Math.floor(rng * 3) + 1,
    });
  }

  if (rng > 0.8) {
    items.push({ itemId: 'common_trinket', quantity: 1 });
  }

  return items;
}

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const request: AdventureRequest = await req.json();

    const location = LOCATIONS[request.locationId];
    if (!location) {
      return new Response(JSON.stringify({ success: false, message: 'Unknown location' }), { status: 400 });
    }

    if ((request.needsSnapshot?.energy || 0) < location.energyCost) {
      return new Response(JSON.stringify({ success: false, message: 'Not enough energy' }), { status: 400 });
    }

    const serverSeed = `${request.buddySeed}:${request.locationId}:${Math.floor(request.clientTimestamp / 3600000)}`;
    const serverRng = seededRandom(serverSeed);

    const statChecks: Record<string, { required: number; actual: number; passed: boolean }> = {};
    let allPassed = true;
    for (const [stat, required] of Object.entries(location.statChecks)) {
      const actual = request.statSnapshot?.[stat] || 0;
      const passed = actual >= required;
      statChecks[stat] = { required, actual, passed };
      if (!passed) allPassed = false;
    }

    const success = allPassed || serverRng > 0.7;

    const xpReward = success ? Math.floor(15 + serverRng * 25) : 5;
    const bondReward = success ? 2 + Math.floor(serverRng * 3) : 0;
    const coinReward = success ? Math.floor(5 + serverRng * 15) : 1;
    const itemRewards = success ? generateLoot(serverSeed, request.locationId) : [];

    const response: AdventureResponse = {
      success,
      message: success ? 'Adventure successful!' : 'Adventure failed...',
      statChecks,
      xpReward: Math.min(xpReward, 50),
      bondReward: Math.min(bondReward, 5),
      coinReward: Math.min(coinReward, 30),
      itemRewards: itemRewards.slice(0, 3),
      statChanges: success ? { curiosity: Math.floor(serverRng * 3) } : {},
      needsChanges: { energy: -location.energyCost },
    };

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: `Server error: ${error}` }), { status: 500 });
  }
});
