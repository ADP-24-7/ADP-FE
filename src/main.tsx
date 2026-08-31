import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { env } from './shared/config/env';
import './shared/styles/global.css';

async function enableMocking() {
  if (env.apiMode !== 'mock') {
    return;
  }

  const { worker } = await import('./shared/mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

void enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
