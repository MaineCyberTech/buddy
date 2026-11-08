type Unsubscribe = () => void;

let waitingWorker: ServiceWorker | null = null;
let updateAvailable = false;
let reloadWhenActivated = false;
let controllerListenerAttached = false;

const updateListeners = new Set<(available: boolean) => void>();

function notifyUpdate(available: boolean): void {
  updateAvailable = available;
  updateListeners.forEach((listener) => listener(available));
}

export function subscribeToServiceWorkerUpdate(
  listener: (available: boolean) => void
): Unsubscribe {
  updateListeners.add(listener);
  listener(updateAvailable);
  return () => {
    updateListeners.delete(listener);
  };
}

export function getServiceWorkerUpdate(): boolean {
  return updateAvailable;
}

/**
 * Ask the waiting worker to activate. The subsequent `controllerchange` event
 * reloads the page exactly once, so the tab never mixes old assets with the new
 * worker cache (MOB-P2-001).
 */
export function applyServiceWorkerUpdate(): void {
  if (waitingWorker) {
    reloadWhenActivated = true;
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    return;
  }
  if (updateAvailable && typeof window !== 'undefined') {
    window.location.reload();
  }
}

export function dismissServiceWorkerUpdate(): void {
  waitingWorker = null;
  notifyUpdate(false);
}

export function notifyServiceWorkerControllerChange(): void {
  if (!reloadWhenActivated) return;
  reloadWhenActivated = false;
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

/**
 * Watch a registration for a worker that installed while an older worker still
 * controls the page. Such a worker stays in `waiting` until the player accepts
 * the update; it is never activated silently.
 */
export function watchServiceWorkerRegistration(registration: ServiceWorkerRegistration): void {
  const announceWaiting = () => {
    if (registration.waiting && navigator.serviceWorker?.controller) {
      waitingWorker = registration.waiting;
      notifyUpdate(true);
    }
  };

  announceWaiting();

  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    if (!installing) return;

    const onStateChange = () => {
      if (installing.state === 'installed') {
        installing.removeEventListener('statechange', onStateChange);
        announceWaiting();
      }
    };

    installing.addEventListener('statechange', onStateChange);
  });
}

function registerWhenReady(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  const register = () => {
    // Version the worker URL so each build installs a fresh worker and opens a
    // new `buddy-cache-<buildId>` cache; the activate handler purges the rest
    // (ARCH-P2-001).
    const buildId = process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev';
    navigator.serviceWorker
      .register(`/sw.js?v=${encodeURIComponent(buildId)}`)
      .then((registration) => {
        watchServiceWorkerRegistration(registration);
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.warn('SW registration failed:', error);
      });
  };

  if (!controllerListenerAttached) {
    controllerListenerAttached = true;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      notifyServiceWorkerControllerChange();
    });
  }

  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register, { once: true });
  }
}

export function registerServiceWorker(): void {
  registerWhenReady();
}

let installPromptEvent: Event | null = null;
const installListeners = new Set<(available: boolean) => void>();

function notifyInstallPrompt(available: boolean): void {
  installListeners.forEach((listener) => listener(available));
}

export function subscribeToInstallPrompt(listener: (available: boolean) => void): Unsubscribe {
  installListeners.add(listener);
  listener(Boolean(installPromptEvent));
  return () => {
    installListeners.delete(listener);
  };
}

export function listenForInstallPrompt(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPromptEvent = event;
    notifyInstallPrompt(true);
  });
}

export function getInstallPrompt(): Event | null {
  return installPromptEvent;
}

export function clearInstallPrompt(): void {
  installPromptEvent = null;
  notifyInstallPrompt(false);
}
