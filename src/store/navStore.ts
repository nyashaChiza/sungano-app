import { create } from 'zustand';
import type { TabName } from '../navigation/TabNavigator';

interface NavState {
  pendingTab: TabName | null;
  setPendingTab: (tab: TabName | null) => void;
}

export const useNavStore = create<NavState>((set) => ({
  pendingTab: null,
  setPendingTab: tab => set({ pendingTab: tab }),
}));
