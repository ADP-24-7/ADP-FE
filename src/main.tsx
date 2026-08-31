import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { env } from './shared/config/env';
import './shared/styles/global.css';

async function enableMocking() {
  if (env.apiMode !== 'mock') {
    return;
  }

  const { worker } = await import('./app/mocks/browser');
  await worker.start({
    onUnhandledRequest(request, print) {
      const url = new URL(request.url);

      if (url.pathname.startsWith('/v1/')) {
        print.error();
      }
    },
  });
}

void enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
