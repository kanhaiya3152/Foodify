import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider } from './context/AppContext'

export const authService = "http://localhost:5000"
export const restaurantService = "http://localhost:5001"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="810574839992-hsdscj0a5tnr5sr7fl15gjta5pks60bb.apps.googleusercontent.com">
      <AppProvider>
        <App/>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
