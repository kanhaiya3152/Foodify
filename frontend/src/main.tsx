import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider } from './context/AppContext'
import "leaflet/dist/leaflet.css"
import { SocketProvider } from './context/SocketContext'

export const authService = "https://foodify-auth.onrender.com"
export const restaurantService = "https://foodify-restaurant.onrender.com"
export const utilsService = "https://foodify-utils-service.onrender.com"
export const realtimeService = "https://foodify-realtime-service.onrender.com"
export const riderService = "https://foodify-rider-service.onrender.com"
export const adminService = "https://foodify-admin-service.onrender.com"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="810574839992-hsdscj0a5tnr5sr7fl15gjta5pks60bb.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App/>
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
