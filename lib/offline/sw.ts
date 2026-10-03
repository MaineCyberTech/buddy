export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    // Version the worker URL so each build installs a fresh worker and opens a
    // new `buddy-cache-<buildId>` cache; the activate handler purges the rest
    // (ARCH-P2-001).
    const buildId = process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev';
    navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(buildId)}`).then(
      (registration) => {
        console.log('SW registered:', registration.scope);
      },
      (error) => {
        console.warn('SW registration failed:', error);
      }
    );
  });
}

let installPromptEvent: Event | null = null;

export function listenForInstallPrompt(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPromptEvent = event;
  });
}

export function getInstallPrompt(): Event | null {
  return installPromptEvent;
}

export function clearInstallPrompt(): void {
  installPromptEvent = null;
}