import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'; // Tailwind or custom global styles
import { SwissEphProvider } from '@/contexts/SwissEphContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SwissEphProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SwissEphProvider>
  </React.StrictMode>
);
