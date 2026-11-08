import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

class FakeWorker extends EventTarget {
  state: ServiceWorkerState = 'installing';
  postMessage = vi.fn();
}

class FakeRegistration extends EventTarget {
  installing: FakeWorker | null = null;
  waiting: FakeWorker | null = null;
  scope = '/';
}

type SwModule = typeof import('@/lib/offline/sw');

let sw: SwModule;

beforeEach(async () => {
  vi.resetModules();
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { controller: {} },
  });
  sw = await import('@/lib/offline/sw');
});

afterEach(() => {
  delete (navigator as { serviceWorker?: unknown }).serviceWorker;
});

// MOB-P2-001: a waiting worker must surface an update state and only activate
// after the player accepts; the old worker is never replaced silently.
describe('Service worker update flow', () => {
  it('transitions update available -> accepted -> dismissed', () => {
    const seen: boolean[] = [];
    const unsubscribe = sw.subscribeToServiceWorkerUpdate((available) => seen.push(available));

    expect(seen).toEqual([false]);

    const registration = new FakeRegistration();
    const installing = new FakeWorker();
    registration.installing = installing;
    sw.watchServiceWorkerRegistration(registration as unknown as ServiceWorkerRegistration);

    registration.dispatchEvent(new Event('updatefound'));
    expect(sw.getServiceWorkerUpdate()).toBe(false);

    // The browser promotes the installed worker to `waiting` before firing the
    // statechange event.
    installing.state = 'installed';
    registration.waiting = installing;
    installing.dispatchEvent(new Event('statechange'));

    expect(sw.getServiceWorkerUpdate()).toBe(true);
    expect(seen).toEqual([false, true]);

    sw.applyServiceWorkerUpdate();
    expect(installing.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });

    sw.dismissServiceWorkerUpdate();
    expect(sw.getServiceWorkerUpdate()).toBe(false);
    expect(seen).toEqual([false, true, false]);

    unsubscribe();
  });

  it('does not announce an update when no old worker controls the page', () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { controller: null },
    });
    const seen: boolean[] = [];
    sw.subscribeToServiceWorkerUpdate((available) => seen.push(available));

    const registration = new FakeRegistration();
    const waiting = new FakeWorker();
    waiting.state = 'installed';
    registration.waiting = waiting;

    sw.watchServiceWorkerRegistration(registration as unknown as ServiceWorkerRegistration);

    expect(seen).toEqual([false]);
    expect(sw.getServiceWorkerUpdate()).toBe(false);
  });

  it('subscribes to install prompts without polling', () => {
    const seen: boolean[] = [];
    const unsubscribe = sw.subscribeToInstallPrompt((available) => seen.push(available));
    expect(seen).toEqual([false]);

    sw.listenForInstallPrompt();
    window.dispatchEvent(new Event('beforeinstallprompt'));
    expect(seen).toEqual([false, true]);

    sw.clearInstallPrompt();
    expect(seen).toEqual([false, true, false]);
    unsubscribe();
  });
});
