/**
 * ============================================================
 * FILE: src/redux/store.ts
 * PURPOSE: Configures and exports the Redux Toolkit store.
 *          The store is the single source of truth for all
 *          client-side state in the SG Fire application.
 *
 * SLICES (state domains):
 *  - auth     : User authentication state (user, token, loading)
 *  - cart     : Shopping cart items and totals
 *  - wishlist : Wishlisted product IDs
 *  - ui       : UI state (modals, sidebar open/close, dark mode)
 *
 * USAGE:
 *   import { store, RootState, AppDispatch } from '@/redux/store';
 *   const { data } = useSelector((state: RootState) => state.cart);
 *   const dispatch = useDispatch<AppDispatch>();
 * ============================================================
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import uiReducer from './slices/uiSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,       // User authentication state
    cart: cartReducer,       // Shopping cart state
    wishlist: wishlistReducer, // Wishlist product IDs
    ui: uiReducer,           // UI state (modals, sidebar, theme)
    product: productReducer, // Product catalog and admin state
    category: categoryReducer, // Category state
  },

  // Middleware configuration
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check for Date objects in state
      // (Some middleware like redux-persist uses non-serializable values)
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),

  // Enable Redux DevTools Extension in development only
  devTools: process.env.NODE_ENV !== 'production',
});

// ── Type Exports ─────────────────────────────────────────────
// These types are used throughout the app for typed dispatch and selectors

/** The complete state shape of the Redux store */
export type RootState = ReturnType<typeof store.getState>;

/** The dispatch function type (supports thunks) */
export type AppDispatch = typeof store.dispatch;

// Expose store globally for Axios interceptor token access
// This is the only safe way to access Redux state outside of React components
if (typeof window !== 'undefined') {
  (window as any).__REDUX_STORE__ = store;
}
