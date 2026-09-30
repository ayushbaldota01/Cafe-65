import { create } from 'zustand';

interface AuthState {
  user: { uid: string; phone: string } | null;
  login: (phone: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (phone) => set({ user: { uid: `mock-uid-${Date.now()}`, phone } }),
  logout: () => set({ user: null })
}));
