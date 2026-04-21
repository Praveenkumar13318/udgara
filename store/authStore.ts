import { create } from "zustand";

type User = {
  publicId: string;
};

type AuthState = {
  user: User | null;
  isHydrated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  hydrate: () => void;
};

const getInitialUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("publicId");
  return stored ? { publicId: stored } : null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  isHydrated: typeof window !== "undefined",

  setUser: (user) => {
    localStorage.setItem("publicId", user.publicId);
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("publicId");
    localStorage.removeItem("token");
    set({ user: null, isHydrated: true });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("publicId");
    if (stored) {
      set({ user: { publicId: stored }, isHydrated: true });
    } else {
      set({ user: null, isHydrated: true });
    }
  },
}));