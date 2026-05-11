/**
 * ============================================================
 * FILE: src/redux/slices/wishlistSlice.ts
 * PURPOSE: Manages the wishlist state in Redux.
 * ============================================================
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { fetchMe, loginUser } from './authSlice';

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
    optimisticToggle: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const index = state.items.indexOf(productId);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(productId);
      }
    },
    setWishlist: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
    },
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
        state.items = action.payload.wishlist;
      })
      .addMatcher(
        (action) => [loginUser.fulfilled.type, fetchMe.fulfilled.type].includes(action.type),
        (state, action: any) => {
          state.items = action.payload.user.wishlist || [];
        }
      );
  },
});

export const { optimisticToggle, setWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
