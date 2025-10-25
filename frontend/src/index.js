import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { loadConfig } from './config'; 

async function bootstrap() {
  const root = ReactDOM.createRoot(document.getElementById('root'));

  try {
    const cfg = await loadConfig();
    window.APP_CONFIG = cfg; // optional global
    root.render(
      <React.StrictMode>
        <App config={cfg} />
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Failed to load config, falling back to defaults', err);
    const fallbackConfig = { shifts: [], test_duration: 10 };
    root.render(
      <React.StrictMode>
        <App config={fallbackConfig} />
      </React.StrictMode>
    );
  }
}

bootstrap();
