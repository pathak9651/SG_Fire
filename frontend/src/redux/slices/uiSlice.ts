/**
 * ============================================================
 * FILE: src/redux/slices/uiSlice.ts
 * PURPOSE: Manages all UI state that needs to be shared across
 *          multiple components. This avoids prop drilling for
 *          common UI states like modals, sidebar, and dark mode.
 *
 * STATE:
 *  isMobileMenuOpen  : Mobile hamburger menu open/close
 *  isSearchOpen      : Global search bar open/close
 *  isCartDrawerOpen  : Cart side drawer open/close
 *  isDarkMode        : Dark/light theme toggle
 *  activeModal       : Which modal is currently shown (null = none)
 *
 * USAGE:
 *   dispatch(openCartDrawer())
 *   const { isDarkMode } = useSelector((s) => s.ui)
 * ============================================================
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ModalType = 'login' | 'addReview' | 'confirmDelete' | 'imageViewer' | null;

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isCartDrawerOpen: boolean;
  isDarkMode: boolean;
  activeModal: ModalType;
  modalData: unknown; // Data passed to the active modal
}

const initialState: UIState = {
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCartDrawerOpen: false,
  // Keep the first client render identical to SSR. The saved preference is
  // applied after hydration by the navbar.
  isDarkMode: false,
  activeModal: null,
  modalData: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,

  reducers: {
    // ── Mobile Menu ────────────────────────────────────────
    toggleMobileMenu: (state) => { state.isMobileMenuOpen = !state.isMobileMenuOpen; },
    closeMobileMenu: (state) => { state.isMobileMenuOpen = false; },

    // ── Search Bar ─────────────────────────────────────────
    toggleSearch: (state) => { state.isSearchOpen = !state.isSearchOpen; },
    closeSearch: (state) => { state.isSearchOpen = false; },

    // ── Cart Drawer ────────────────────────────────────────
    openCartDrawer: (state) => { state.isCartDrawerOpen = true; },
    closeCartDrawer: (state) => { state.isCartDrawerOpen = false; },
    toggleCartDrawer: (state) => { state.isCartDrawerOpen = !state.isCartDrawerOpen; },

    // ── Dark Mode ──────────────────────────────────────────
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sgfire-theme', state.isDarkMode ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', state.isDarkMode);
      }
    },

    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      // Persist preference to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sgfire-theme', state.isDarkMode ? 'dark' : 'light');
        // Apply/remove 'dark' class on <html> element for Tailwind dark mode
        document.documentElement.classList.toggle('dark', state.isDarkMode);
      }
    },

    // ── Modals ─────────────────────────────────────────────
    openModal: (state, action: PayloadAction<{ type: ModalType; data?: unknown }>) => {
      state.activeModal = action.payload.type;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
  },
});

export const {
  toggleMobileMenu, closeMobileMenu,
  toggleSearch, closeSearch,
  openCartDrawer, closeCartDrawer, toggleCartDrawer,
  setDarkMode, toggleDarkMode,
  openModal, closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
