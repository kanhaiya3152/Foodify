import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider } from './context/AppContext'
import "leaflet/dist/leaflet.css"
import { SocketProvider } from './context/SocketContext'

const authServiceUrl = import.meta.env.VITE_AUTH_SERVICE ?? 'http://localhost:5000'
const restaurantServiceUrl = import.meta.env.VITE_RESTAURANT_SERVICE ?? 'http://localhost:5001'
const utilsServiceUrl = import.meta.env.VITE_UTILS_SERVICE ?? 'http://localhost:5002'
const realtimeServiceUrl = import.meta.env.VITE_REALTIME_SERVICE ?? 'http://localhost:5004'
const riderServiceUrl = import.meta.env.VITE_RIDER_SERVICE ?? 'http://localhost:5005'
const adminServiceUrl = import.meta.env.VITE_ADMIN_SERVICE ?? 'http://localhost:5006'

export const authService = authServiceUrl
export const restaurantService = restaurantServiceUrl
export const utilsService = utilsServiceUrl
export const realtimeService = realtimeServiceUrl
export const riderService = riderServiceUrl
export const adminService = adminServiceUrl

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
