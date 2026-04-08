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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,

  setUser: (user) => {
    localStorage.setItem("publicId", user.publicId);
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("publicId");
    set({ user: null });
  },

  hydrate: () => {
    const stored = localStorage.getItem("publicId");

    if (stored) {
      set({
        user: { publicId: stored },
        isHydrated: true,
      });
    } else {
      set({ user: null, isHydrated: true });
    }
  },
}));