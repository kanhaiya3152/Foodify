import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import { authService, restaurantService } from "../main";
import type { ICart, LocationData, User } from "../types";

//State Shape 

interface AppState {
  // Auth slice
  user: User | null;
  isAuth: boolean;
  loading: boolean;

  // Cart slice (persisted to localStorage)
  cart: ICart[];
  subTotal: number;
  quauntity: number;

  // Location slice (cached in sessionStorage)
  location: LocationData | null;
  loadingLocation: boolean;
  city: string;
}

//  Actions Shape

interface AppActions {
  // Plain setters (replaces React.Dispatch)
  setUser: (user: User | null) => void;
  setIsAuth: (val: boolean) => void;
  setLoading: (val: boolean) => void;

  // Async actions
  fetchUser: () => Promise<void>;
  fetchCart: () => Promise<void>;
  initLocation: () => void;

  // One-shot logout — resets everything atomically
  logout: () => void;
}

// Initial State 

const initialState: AppState = {
  user: null,
  isAuth: false,
  loading: true,
  cart: [],
  subTotal: 0,
  quauntity: 0,
  location: null,
  loadingLocation: false,
  city: "Fetching Location...",
};

//Store

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Plain setters ──
      setUser: (user) => set({ user }),
      setIsAuth: (isAuth) => set({ isAuth }),
      setLoading: (loading) => set({ loading }),

      // ── Fetch the logged-in user from auth service ──
      fetchUser: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          set({ loading: false });
          return;
        }
        try {
          const { data } = await axios.get(`${authService}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: data, isAuth: true });
        } catch {
          set({ user: null, isAuth: false });
        } finally {
          set({ loading: false });
        }
      },

      // ── Fetch cart — only runs for customers ──
      fetchCart: async () => {
        const { user } = get();
        if (!user || user.role !== "customer") return;
        try {
          const { data } = await axios.get(
            `${restaurantService}/api/cart/all`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          set({
            cart: data.cart ?? [],
            subTotal: data.subtotal ?? 0,
            quauntity: data.cartLength ?? 0,
          });
        } catch {
          // silently fail — cart stays at last known state
        }
      },

      // ── Init geolocation with sessionStorage cache ──
      initLocation: () => {
        // Return early if already loaded this session
        const cached = sessionStorage.getItem("foodify_location");
        if (cached) {
          try {
            const { location, city } = JSON.parse(cached);
            set({ location, city, loadingLocation: false });
            return;
          } catch {
            sessionStorage.removeItem("foodify_location");
          }
        }

        if (!navigator.geolocation) {
          alert("Please allow location to continue");
          return;
        }

        set({ loadingLocation: true });

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await res.json();

              const location: LocationData = {
                latitude,
                longitude,
                formattedAddress: data.display_name || "Current Location",
              };
              const city =
                data.address?.city ||
                data.address?.town ||
                data.address?.village ||
                "Your Location";

              set({ location, city, loadingLocation: false });

              // Cache for this browser session so we don't call Nominatim again
              sessionStorage.setItem(
                "foodify_location",
                JSON.stringify({ location, city })
              );
            } catch {
              const location: LocationData = {
                latitude,
                longitude,
                formattedAddress: "Current Location",
              };
              set({ location, city: "Failed to load", loadingLocation: false });
            }
          },
          () => {
            // User denied location
            set({ loadingLocation: false, city: "Location denied" });
          }
        );
      },

      // ── Atomic logout — clears store, token and caches in one call ──
      logout: () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("foodify_location");
        // Reset everything except persisted cart fields
        set({ ...initialState, loading: false });
      },
    }),
    {
      name: "foodify-cart",
      storage: createJSONStorage(() => localStorage),
      // Only persist the cart slice — auth/location are always re-fetched fresh
      partialize: (state) => ({
        cart: state.cart,
        subTotal: state.subTotal,
        quauntity: state.quauntity,
      }),
    }
  )
);
