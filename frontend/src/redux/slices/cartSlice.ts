/**
 * ============================================================
 * FILE: src/redux/slices/cartSlice.ts
 * PURPOSE: Manages shopping cart state in Redux.
 *          Syncs with the backend cart API to keep prices accurate.
 *          Guest cart is stored locally; merged with DB on login.
 *
 * STATE SHAPE:
 *  cart      : Full cart object with items array and totals
 *  isLoading : True during API calls
 *  error     : Error message if operation fails
 *
 * DESIGN: Server is the source of truth for prices.
 *         Frontend only stores quantity in Redux.
 *         All price calculations happen on the server.
 * ============================================================
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { Cart, CartState } from '@/types';
import { AxiosError } from 'axios';

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

// ── Async Thunks ───────────────────────────────────────────

/** Fetch current user's cart from server (with live prices) */
export const fetchCart = createAsyncThunk<Cart, void, { rejectValue: string }>(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/cart');
      return data.data;
    } catch (error) {
      const e = error as AxiosError<{ message: string }>;
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

/** Add a product to cart */
export const addToCart = createAsyncThunk<
  Cart,
  { productId: string; quantity?: number },
  { rejectValue: string }
>('cart/add', async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/add', { productId, quantity });
    return data.data;
  } catch (error) {
    const e = error as AxiosError<{ message: string }>;
    return rejectWithValue(e.response?.data?.message || 'Failed to add to cart');
  }
});

/** Update item quantity in cart */
export const updateCartItem = createAsyncThunk<
  Cart,
  { productId: string; quantity: number },
  { rejectValue: string }
>('cart/update', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/cart/update', { productId, quantity });
    return data.data;
  } catch (error) {
    const e = error as AxiosError<{ message: string }>;
    return rejectWithValue(e.response?.data?.message || 'Failed to update cart');
  }
});

/** Remove item from cart */
export const removeFromCart = createAsyncThunk<Cart, string, { rejectValue: string }>(
  'cart/remove',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/remove/${productId}`);
      return data.data;
    } catch (error) {
      const e = error as AxiosError<{ message: string }>;
      return rejectWithValue(e.response?.data?.message || 'Failed to remove item');
    }
  }
);

/** Apply coupon code */
export const applyCoupon = createAsyncThunk<
  { discount: number; couponCode: string },
  string,
  { rejectValue: string }
>('cart/applyCoupon', async (code, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/coupon', { code });
    return data.data;
  } catch (error) {
    const e = error as AxiosError<{ message: string }>;
    return rejectWithValue(e.response?.data?.message || 'Invalid coupon');
  }
});

// ── Cart Slice ─────────────────────────────────────────────
const cartSlice = createSlice({
  name: 'cart',
  initialState,

  reducers: {
    /** Clear cart from Redux state (called after successful order placement) */
    clearCart: (state) => {
      state.cart = null;
    },
  },

  extraReducers: (builder) => {
    // Helper: set loading state (reduces boilerplate)
    const setLoading = (state: CartState) => { state.isLoading = true; state.error = null; };
    const setCart = (state: CartState, action: PayloadAction<Cart>) => {
      state.isLoading = false;
      state.cart = action.payload;
    };
    const setError = (state: CartState, action: PayloadAction<string | undefined>) => {
      state.isLoading = false;
      state.error = action.payload || 'Unknown error';
    };

    builder
      .addCase(fetchCart.pending, setLoading)
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state, action) => setError(state, action))

      .addCase(addToCart.pending, setLoading)
      .addCase(addToCart.fulfilled, setCart)
      .addCase(addToCart.rejected, (state, action) => setError(state, action))

      .addCase(updateCartItem.pending, setLoading)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(updateCartItem.rejected, (state, action) => setError(state, action))

      .addCase(removeFromCart.pending, setLoading)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(removeFromCart.rejected, (state, action) => setError(state, action))

      .addCase(applyCoupon.fulfilled, (state, action) => {
        // Update the coupon info in cart state after successful coupon application
        if (state.cart) {
          state.cart.appliedCoupon = {
            code: action.payload.couponCode,
            discount: action.payload.discount,
          };
        }
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
