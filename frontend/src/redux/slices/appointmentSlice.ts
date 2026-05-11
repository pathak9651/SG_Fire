import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

interface AppointmentState {
  appointments: any[];
  myAppointments: any[];
  currentAppointment: any | null;
  isLoading: boolean;
  isError: boolean;
  message: string;
  totalAppointments: number;
  totalPages: number;
  currentPage: number;
}

const initialState: AppointmentState = {
  appointments: [],
  myAppointments: [],
  currentAppointment: null,
  isLoading: false,
  isError: false,
  message: '',
  totalAppointments: 0,
  totalPages: 1,
  currentPage: 1,
};

// Admin: Get all appointments
export const getAllAdminAppointments = createAsyncThunk(
  'appointments/getAllAdmin',
  async ({ page = 1, status = '' }: { page?: number, status?: string }, thunkAPI) => {
    try {
      const response = await api.get(`/appointments?page=${page}&status=${status}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// User: Get my appointments
export const getMyAppointments = createAsyncThunk(
  'appointments/getMy',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/appointments/my');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Book new appointment
export const bookAppointment = createAsyncThunk(
  'appointments/book',
  async (formData: FormData, thunkAPI) => {
    try {
      // Use FormData for multipart/form-data (site images)
      const response = await api.post('/appointments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Approve
export const approveAppointment = createAsyncThunk(
  'appointments/approve',
  async (id: string, thunkAPI) => {
    try {
      const response = await api.patch(`/appointments/${id}/approve`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Reject
export const rejectAppointment = createAsyncThunk(
  'appointments/reject',
  async ({ id, reason }: { id: string, reason: string }, thunkAPI) => {
    try {
      const response = await api.patch(`/appointments/${id}/reject`, { reason });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Reschedule
export const rescheduleAppointment = createAsyncThunk(
  'appointments/reschedule',
  async ({ id, preferredDate, preferredTime, message }: { id: string, preferredDate: string, preferredTime: string, message?: string }, thunkAPI) => {
    try {
      const response = await api.patch(`/appointments/${id}/reschedule`, { preferredDate, preferredTime, message });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    resetAppointmentState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllAdminAppointments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllAdminAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload.data;
        state.totalAppointments = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getAllAdminAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(getMyAppointments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myAppointments = action.payload.data;
      })
      .addCase(getMyAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(approveAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(a => a._id === action.payload.data._id);
        if (index !== -1) {
          state.appointments[index] = action.payload.data;
        }
      })
      .addCase(rejectAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(a => a._id === action.payload.data._id);
        if (index !== -1) {
          state.appointments[index] = action.payload.data;
        }
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(a => a._id === action.payload.data._id);
        if (index !== -1) {
          state.appointments[index] = action.payload.data;
        }
      });
  },
});

export const { resetAppointmentState } = appointmentSlice.actions;
export default appointmentSlice.reducer;
