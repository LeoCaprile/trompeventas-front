import { create } from "zustand";
import type { UserT } from "~/services/auth/auth.types";

interface UserStore {
  user: UserT | null;
  setUser: (user: UserT) => void;
  clearUserData: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user: UserT) => set(() => ({ user })),
  clearUserData: () => set(() => ({ user: null })),
}));
