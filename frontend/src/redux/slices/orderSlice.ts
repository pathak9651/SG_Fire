import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

interface OrderState {
  orders: any[];
  myOrders: any[];
  currentOrder: any | null;
  isLoading: boolean;
  isError: boolean;
  message: string;
  totalOrders: number;
  totalPages: number;
  currentPage: number;
}

const initialState: OrderState = {
  orders: [],
  myOrders: [],
  currentOrder: null,
  isLoading: false,
  isError: false,
  message: '',
  totalOrders: 0,
  totalPages: 1,
  currentPage: 1,
};

// Admin: Get all orders
export const getAllAdminOrders = createAsyncThunk(
  'orders/getAllAdmin',
  async ({ page = 1, status = '' }: { page?: number, status?: string }, thunkAPI) => {
    try {
      const response = await api.get(`/orders?page=${page}&status=${status}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// User: Get my orders
export const getMyOrders = createAsyncThunk(
  'orders/getMy',
  async ({ page = 1 }: { page?: number }, thunkAPI) => {
    try {
      const response = await api.get(`/orders/my?page=${page}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single order
export const getOrderDetails = createAsyncThunk(
  'orders/getDetails',
  async (id: string, thunkAPI) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create Razorpay Order
export const createRazorpayOrder = createAsyncThunk(
  'orders/createRazorpay',
  async (amount: number, thunkAPI) => {
    try {
      const response = await api.post('/orders/razorpay-order', { amount });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Place Order
export const placeOrder = createAsyncThunk(
  'orders/place',
  async (orderData: any, thunkAPI) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status, message }: { id: string, status: string, message?: string }, thunkAPI) => {
    try {
      const response = await api.patch(`/orders/${id}/status`, { status, message });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Admin Orders
      .addCase(getAllAdminOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllAdminOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.totalOrders = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getAllAdminOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Get My Orders
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myOrders = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Get Order Details
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the order in the list if present
        const index = state.orders.findIndex(o => o._id === action.payload.data._id);
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
        if (state.currentOrder?._id === action.payload.data._id) {
          state.currentOrder = action.payload.data;
        }
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
