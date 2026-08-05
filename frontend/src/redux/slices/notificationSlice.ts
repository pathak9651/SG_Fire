import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface NotificationItem {
  _id: string;
  id?: string;
  type: 'order' | 'appointment' | 'stock' | 'system' | 'promo';
  title: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
  target?: 'admin' | 'user';
  user?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  isLoading: false,
  error: null,
};

// ─────────────────────────────────────────────
// ASYNC THUNKS (Database persisted)
// ─────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk<
  NotificationItem[],
  void,
  { rejectValue: string }
>('notification/fetchNotifications', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications');
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
  }
});

export const markNotificationAsRead = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('notification/markAsRead', async (id, { rejectWithValue }) => {
  try {
    await api.patch(`/notifications/${id}/read`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
  }
});

export const markAllNotificationsAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('notification/markAllAsRead', async (_, { rejectWithValue }) => {
  try {
    await api.patch('/notifications/read-all');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
  }
});

export const deleteNotification = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('notification/deleteNotification', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/notifications/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
  }
});

export const clearAllNotifications = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('notification/clearAllNotifications', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/notifications/clear-all');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to clear notifications');
  }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addRealtimeNotification: (state, action: PayloadAction<NotificationItem>) => {
      if (!state.notifications.some((n) => (n._id || n.id) === (action.payload._id || action.payload.id))) {
        state.notifications.unshift(action.payload);
      }
    },
    // Backwards-compatible dummy reducers to avoid breaking existing calls
    addNotification: (state) => {
      return state;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.notifications.find((n) => (n._id || n.id) === action.payload);
      if (item) item.isRead = true;
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => { n.isRead = true; });
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    syncNotifications: (state) => {
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const item = state.notifications.find((n) => (n._id || n.id) === action.payload);
        if (item) {
          item.isRead = true;
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          (n) => (n._id || n.id) !== action.payload
        );
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
      });
  },
});

export const {
  addRealtimeNotification,
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  syncNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
