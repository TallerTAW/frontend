// frontend/src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 🚨 1. Importar el ContentProvider desde tu carpeta context
import { ContentProvider } from './context/ContentContext' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 🚨 2. Envolver la aplicación con ContentProvider */}
    <ContentProvider>
      <App />
    </ContentProvider>
  </StrictMode>,
)