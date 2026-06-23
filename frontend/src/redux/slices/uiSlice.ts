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
 *  activeModal       : Which modal is currently shown (null = none)
 *
 * USAGE:
 *   dispatch(openCartDrawer())
 *   // Theme is fixed to light; no dark-mode state available.
 * ============================================================
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ModalType = 'login' | 'addReview' | 'confirmDelete' | 'imageViewer' | null;

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isCartDrawerOpen: boolean;
  activeModal: ModalType;
  modalData: unknown; // Data passed to the active modal
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCartDrawerOpen: false,
  activeModal: null,
  modalData: null,
  theme: 'light',
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

    // ── Theme Management ───────────────────────────────────
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
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
  setTheme, toggleTheme,
  openModal, closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
