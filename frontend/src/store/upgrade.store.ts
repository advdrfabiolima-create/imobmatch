import { create } from "zustand";

interface UpgradeState {
  isOpen: boolean;
  message: string;
  open: (message: string) => void;
  close: () => void;
}

export const useUpgradeStore = create<UpgradeState>((set) => ({
  isOpen: false,
  message: "",
  open: (message) => set({ isOpen: true, message }),
  close: () => set({ isOpen: false, message: "" }),
}));
