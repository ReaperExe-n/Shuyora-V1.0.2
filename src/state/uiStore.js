// src/state/uiStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// UI store for global UI state: theme (light/dark), sidebar open/closed, etc.
export const useUiStore = create(
  persist(
    (set) => ({
      // Theme: "light" or "dark"
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      // Sidebar drawer state
      isSidebarOpen: false,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
    }),
    {
      name: 'shuyora-ui', // storage key
    }
  )
);
