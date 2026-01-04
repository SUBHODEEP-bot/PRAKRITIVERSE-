if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registered:', registration);
      },
      (err) => {
        console.log('ServiceWorker registration failed:', err);
      }
    );
  });
}

// Handle app installation prompt
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show install button/prompt to user
  console.log('Install prompt available');
});

// Handle successful installation
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
});

export { deferredPrompt };
