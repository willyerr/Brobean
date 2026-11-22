import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './index.css';
import { Capacitor } from '@capacitor/core';
import { initializeLocalDatabase } from './services/localDatabase';

async function startApp() {
  if (Capacitor.isNativePlatform()) {
    await initializeLocalDatabase();
  }

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

void startApp().catch((error: unknown) => {
  console.error('Brobean failed to initialize:', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<main style="padding:24px;font-family:system-ui"><h1>Brobean tidak dapat dimulai</h1><p>Database lokal gagal dibuka. Tutup aplikasi lalu coba lagi.</p></main>';
  }
});
