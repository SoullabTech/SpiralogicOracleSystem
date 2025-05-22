// src/main.tsx
import { SwissEphProvider } from '@/contexts/SwissEphContext'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'; // your tailwind or global styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SwissEphProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SwissEphProvider>
  </React.StrictMode>
)
