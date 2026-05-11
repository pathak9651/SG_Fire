import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
import { Product } from '@/types';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  isError: boolean;
  message: string;
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  isError: false,
  message: '',
};

// Get all products
export const getAdminProducts = createAsyncThunk(
  'products/getAllAdmin',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete product
export const deleteAdminProduct = createAsyncThunk(
  'products/delete',
  async (id: string, thunkAPI) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return { id, message: response.data.message };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single product
export const getSingleProduct = createAsyncThunk(
  'products/getSingle',
  async (id: string, thunkAPI) => {
    try {
      const response = await api.get(`/products/${id}`); 
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update product stock only
export const updateProductStock = createAsyncThunk(
  'products/updateStock',
  async ({ id, stock }: { id: string, stock: number }, thunkAPI) => {
    try {
      const response = await api.patch(`/products/${id}/stock`, { stock });
      return { id, stock: response.data.data.stock };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create product
export const createAdminProduct = createAsyncThunk(
  'products/create',
  async (formData: FormData, thunkAPI) => {
    try {
      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update product
export const updateAdminProduct = createAsyncThunk(
  'products/update',
  async ({ id, formData }: { id: string, formData: FormData }, thunkAPI) => {
    try {
      const response = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAdminProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
      })
      .addCase(getAdminProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(deleteAdminProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(p => p._id !== action.payload.id);
        state.message = action.payload.message;
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload.id);
        if (index !== -1) {
          state.products[index].stock = action.payload.stock;
        }
      })
      .addCase(deleteAdminProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;
