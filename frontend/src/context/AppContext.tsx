import { useEffect, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { useAppStore } from "../store/useAppStore";
import type { AppContextType } from "../types";

// ─── Provider ────────────────────────────────────────────────────────────────
// No longer uses React Context at all.
// Its only jobs are: run app-level effects on mount + render <Toaster />.

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const fetchUser = useAppStore((s) => s.fetchUser);
  const initLocation = useAppStore((s) => s.initLocation);
  const fetchCart = useAppStore((s) => s.fetchCart);
  const user = useAppStore((s) => s.user);

  // On mount: fetch authenticated user + initialise geolocation
  useEffect(() => {
    fetchUser();
    initLocation();
  }, []);
   
  // When user changes (e.g. after login), load their cart
  useEffect(() => {
    if (user && user.role === "customer") {
      fetchCart();
    }
  }, [user]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
};

// ─── useAppData — backward-compatible adapter ─────────────────────────────
// All 18 consumer files call useAppData() exactly as before.
// Each field is a separate granular selector → zero wasted re-renders.
// A component that only reads `user` will NOT re-render when `cart` changes.

export const useAppData = (): AppContextType => {
  const user = useAppStore((s) => s.user);
  const isAuth = useAppStore((s) => s.isAuth);
  const loading = useAppStore((s) => s.loading);
  const location = useAppStore((s) => s.location);
  const loadingLocation = useAppStore((s) => s.loadingLocation);
  const city = useAppStore((s) => s.city);
  const cart = useAppStore((s) => s.cart);
  const subTotal = useAppStore((s) => s.subTotal);
  const quauntity = useAppStore((s) => s.quauntity);
  const setUser = useAppStore((s) => s.setUser);
  const setIsAuth = useAppStore((s) => s.setIsAuth);
  const setLoading = useAppStore((s) => s.setLoading);
  const fetchCart = useAppStore((s) => s.fetchCart);

  return {
    user,
    isAuth,
    loading,
    setUser,
    setIsAuth,
    setLoading,
    location,
    loadingLocation,
    city,
    cart,
    fetchCart,
    subTotal,
    quauntity,
  };
};
