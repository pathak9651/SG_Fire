/**
 * ============================================================
 * FILE: src/redux/slices/wishlistSlice.ts
 * PURPOSE: Manages the wishlist state in Redux.
 *          Stores the list of product IDs the user has wishlisted.
 *          Persisted to the backend (User.wishlist[]) and also
 *          cached locally for instant UI updates.
 *
 * OPTIMISTIC UI PATTERN:
 *  - When user clicks the wishlist heart, update Redux state IMMEDIATELY
 *  - Then sync to server in the background
 *  - If server call fails, rollback the Redux state change
 *  - This gives instant feedback without waiting for server response
 * ============================================================
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

interface WishlistState {
  items: string[];  // Array of product IDs
  isLoading: boolean;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
};

/** Fetch user's wishlist from their profile */
export const fetchWishlist = createAsyncThunk<string[]>(
  'wishlist/fetch',
  async () => {
    const { data } = await api.get('/auth/me');
    return data.data.wishlist || [];
  }
);

/** Toggle a product in/out of wishlist */
export const toggleWishlist = createAsyncThunk<
  { wishlist: string[] },
  string // productId
>('wishlist/toggle', async (productId) => {
  const { data } = await api.post(`/users/wishlist/${productId}`);
  return data;
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,

  reducers: {
    /**
     * optimisticToggle: Instantly toggle wishlist in UI without waiting for server.
     * Used in conjunction with toggleWishlist thunk for best UX.
     */
    optimisticToggle: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const index = state.items.indexOf(productId);
      if (index >= 0) {
        state.items.splice(index, 1); // Remove (already wishlisted)
      } else {
        state.items.push(productId); // Add to wishlist
      }
    },

    /** Set wishlist from external source (e.g., user profile fetch) */
    setWishlist: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
    },

    /** Clear wishlist on logout */
    clearWishlist: (state) => {
      state.items = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        // Sync with server-confirmed state (overrides optimistic update)
        state.items = action.payload.wishlist;
      });
  },
});

export const { optimisticToggle, setWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
