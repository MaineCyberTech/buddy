export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
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