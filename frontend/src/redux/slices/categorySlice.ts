import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  message: string;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const getCategories = createAsyncThunk(
  'categories/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/categories'); // Assuming this endpoint exists
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.data;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = categorySlice.actions;
export default categorySlice.reducer;
