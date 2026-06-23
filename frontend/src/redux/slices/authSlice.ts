/**
 * ============================================================
 * FILE: src/redux/slices/authSlice.ts
 * PURPOSE: Manages authentication state in Redux.
 *          Stores the logged-in user's profile and authentication loading states.
 *
 * STATE SHAPE:
 *  user           : User profile object (null if not logged in)
 *  isAuthenticated: Derived boolean — true when user is not null
 *  isLoading      : True while auth API calls are in progress
 *  error          : Error message from failed auth operations
 *
 * ASYNC THUNKS (API calls):
 *  loginUser()    - POST /api/auth/login
 *  registerUser() - POST /api/auth/register
 *  logoutUser()   - POST /api/auth/logout
 *  fetchMe()      - GET /api/auth/me (to restore session on page refresh)
 *
 * USAGE:
 *   const { user, isAuthenticated } = useSelector((s) => s.auth);
 *   dispatch(loginUser({ email, password }));
 * ============================================================
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { User, AuthState } from '@/types';
import { AxiosError } from 'axios';

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  // Start as not loading to avoid SSR/client hydration mismatches.
  isLoading: false,
  isInitialized: false,
};

// ─────────────────────────────────────────────
// @desc    Update Profile Details
// ─────────────────────────────────────────────
export const updateProfile = createAsyncThunk<
  User,
  { name: string; phone: string },
  { rejectValue: string }
>('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/users/profile', profileData);
    return data.data; // Returns updated user object
  } catch (error) {
    const e = error as AxiosError<{ message: string }>;
    return rejectWithValue(e.response?.data?.message || 'Failed to update profile');
  }
});

// ─────────────────────────────────────────────
// @desc    Update Password
// ─────────────────────────────────────────────
export const updatePassword = createAsyncThunk<
  string,
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>('auth/updatePassword', async (passwordData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/users/password', passwordData);
    return data.message;
  } catch (error) {
    const e = error as AxiosError<{ message: string }>;
    return rejectWithValue(e.response?.data?.message || 'Failed to update password');
  }
});

// ─────────────────────────────────────────────
// ASYNC THUNKS
// Each thunk handles one async operation with pending/fulfilled/rejected states
// ─────────────────────────────────────────────

/**
 * loginUser Thunk
 * ---------------
 * Sends login credentials to the API.
 * On success: stores user + access token in Redux state.
 * The refresh token is set as HTTP-only cookie by the server automatically.
 */
export const loginUser = createAsyncThunk<
  { user: User; accessToken: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return { user: data.user, accessToken: data.accessToken };
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Login failed');
  }
});

/**
 * registerUser Thunk
 * ------------------
 * Registers a new account. Returns userId so frontend can
 * redirect to OTP verification page.
 */
export const registerUser = createAsyncThunk<
  { userId: string; message: string; debugOtp?: string },
  { name: string; email: string; phone: string; password: string },
  { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return { userId: data.userId, message: data.message, debugOtp: data.debugOtp };
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Registration failed');
  }
});

/**
 * logoutUser Thunk
 * ----------------
 * Calls logout API to clear HTTP-only cookies, then clears Redux state.
 */
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
});

/**
 * fetchMe Thunk
 * -------------
 * Called on app initialization to restore user session.
 * Uses the HTTP-only refresh cookie to get current user data.
 * If refresh cookie is expired/invalid, user is logged out.
 */
export const fetchMe = createAsyncThunk<
  { user: User; accessToken: string | null },
  void,
  { rejectValue: string }
>('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/session');

    if (!data.authenticated) {
      return rejectWithValue('No active session');
    }

    return { user: data.data, accessToken: data.accessToken || null };
  } catch (error) {
    return rejectWithValue('Session expired');
  }
});

// ─────────────────────────────────────────────
// AUTH SLICE
// ─────────────────────────────────────────────
const setSessionHint = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sgfire_logged_in', 'true');
  }
};

const clearSessionHint = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sgfire_logged_in');
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    /**
     * setCredentials: Used to manually update auth state
     * (e.g., after OTP verification which also logs the user in)
     */
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string | null }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isInitialized = true;
      setSessionHint();
    },

    /**
     * clearCredentials: Manually clear auth state (e.g., on 401 error)
     */
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      clearSessionHint();
    },

    /**
     * updateUser: Update user profile without changing tokens
     * (Used after profile edit operations)
     */
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },

  // Extra reducers handle async thunk states
  extraReducers: (builder) => {
    // ── Login ──────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isInitialized = true;
        setSessionHint();
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        clearSessionHint();
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });

    // ── Register ───────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => { state.isLoading = true; })
      .addCase(registerUser.fulfilled, (state) => { state.isLoading = false; })
      .addCase(registerUser.rejected, (state) => { state.isLoading = false; });

    // ── Logout ─────────────────────────────────────────────
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      clearSessionHint();
    });

    // ── Fetch Me (session restore) ─────────────────────────
    builder
      .addCase(fetchMe.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isInitialized = true;
        setSessionHint();
      })
      .addCase(fetchMe.rejected, (state) => {
        state.isLoading = false;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        clearSessionHint();
      });
  },
});

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;
