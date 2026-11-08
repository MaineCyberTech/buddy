import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';

type WorkerListener = (event: Record<string, unknown>) => void;

interface FakeCache {
  addAll: (urls: string[]) => Promise<void>;
  put: (request: Request, response: Response) => Promise<void>;
  keys: () => Promise<Request[]>;
  delete: (request: Request) => Promise<boolean>;
}

function loadWorker() {
  const listeners: Record<string, WorkerListener> = {};
  const stores = new Map<string, Map<string, Response>>();
  const cacheObjects = new Map<string, FakeCache>();

  const caches = {
    open: vi.fn(async (name: string) => {
      const existing = cacheObjects.get(name);
      if (existing) return existing;
      const entries = new Map<string, Response>();
      const cache: FakeCache = {
        addAll: vi.fn(async (urls: string[]) => {
          urls.forEach((url) => entries.set(url, new Response('shell')));
        }),
        put: vi.fn(async (request: Request, response: Response) => {
          entries.set(request.url, response);
        }),
        keys: vi.fn(async () =>
          [...entries.keys()].map((url) => new Request(new URL(url, 'https://buddy.test')))
        ),
        delete: vi.fn(async (request: Request) => entries.delete(request.url)),
      };
      stores.set(name, entries);
      cacheObjects.set(name, cache);
      return cache;
    }),
    keys: vi.fn(async () => [...cacheObjects.keys()]),
    delete: vi.fn(async (name: string) => {
      cacheObjects.delete(name);
      stores.delete(name);
      return true;
    }),
    match: vi.fn(async (request: Request | string) => {
      const url = typeof request === 'string' ? request : request.url;
      for (const entries of stores.values()) {
        const hit = entries.get(url);
        if (hit) return hit;
      }
      return undefined;
    }),
  };

  const self = {
    location: { href: 'https://buddy.test/sw.js?v=test-build' },
    addEventListener: (type: string, listener: WorkerListener) => {
      listeners[type] = listener;
    },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn(async () => {}) },
  };

  const fetchMock = vi.fn();
  const source = readFileSync('public/sw.js', 'utf8');
  new Function('self', 'caches', 'fetch', 'Response', 'URL', source)(
    self,
    caches,
    fetchMock,
    Response,
    URL
  );

  return { listeners, self, caches, cacheObjects, fetchMock };
}

// MOB-P2-001 / MOB-P3-002: the worker must wait for an explicit activation
// message, and runtime caching must stay bounded with handled write failures.
describe('service worker script', () => {
  it('keeps a new worker waiting instead of calling skipWaiting on install', async () => {
    const { listeners, self } = loadWorker();
    let waited: Promise<unknown> | undefined;

    listeners.install({ waitUntil: (promise: Promise<unknown>) => { waited = promise; } });
    await waited;

    expect(self.skipWaiting).not.toHaveBeenCalled();

    listeners.message({ data: { type: 'SKIP_WAITING' } });
    expect(self.skipWaiting).toHaveBeenCalledTimes(1);
  });

  it('trims the runtime cache to the configured entry budget', async () => {
    const { listeners, caches, fetchMock } = loadWorker();
    const cache = await caches.open('buddy-cache-test-build');
    for (let i = 0; i < 55; i++) {
      await cache.put(
        new Request(`https://buddy.test/item-${i}`),
        new Response(`item-${i}`)
      );
    }
    fetchMock.mockResolvedValue({
      status: 200,
      type: 'basic',
      clone: () => new Response('fresh'),
    });

    let responded: Promise<Response> | undefined;
    let cached: Promise<unknown> | undefined;
    listeners.fetch({
      request: new Request('https://buddy.test/fresh'),
      respondWith: (promise: Promise<Response>) => { responded = promise; },
      waitUntil: (promise: Promise<unknown>) => { cached = promise; },
    });

    const response = await responded;
    await cached;

    expect(response?.status).toBe(200);
    const keys = await cache.keys();
    expect(keys.length).toBeLessThanOrEqual(50);
    expect(keys.some((request: Request) => request.url.endsWith('/fresh'))).toBe(true);
  });
});
