// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext' // <-- Importe

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider> {/* Envolva o App */}
      <App />
    </ThemeProvider>
  </StrictMode>,
)