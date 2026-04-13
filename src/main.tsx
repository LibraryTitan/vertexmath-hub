import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'
import { HubThemeProvider } from './themeMode'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <HubThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HubThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
