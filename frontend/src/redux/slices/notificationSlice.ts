import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { placeOrder } from './orderSlice';
import { bookAppointment } from './appointmentSlice';
import { updateProductStock } from './productSlice';

export interface NotificationItem {
  id: string;
  type: 'order' | 'appointment' | 'stock' | 'promo';
  title: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
  target: 'admin' | 'client';
  userId?: string; // Associated client user ID
}

interface NotificationState {
  notifications: NotificationItem[];
}

// Load notifications from localStorage helper
const loadInitialState = (): NotificationState => {
  if (typeof window === 'undefined') {
    return { notifications: [] };
  }
  try {
    const serialized = localStorage.getItem('sg_user_notifications');
    if (serialized) {
      return { notifications: JSON.parse(serialized) };
    }
  } catch (e) {
    console.error('Failed to load notifications from localStorage', e);
  }
  return { notifications: [] };
};

// Save notifications to localStorage helper
const saveState = (notifications: NotificationItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('sg_user_notifications', JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications to localStorage', e);
  }
};

const initialState: NotificationState = loadInitialState();

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>>
    ) => {
      const newNotification: NotificationItem = {
        ...action.payload,
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      state.notifications.unshift(newNotification);
      saveState(state.notifications);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.notifications.find((n) => n.id === action.payload);
      if (item) {
        item.isRead = true;
        saveState(state.notifications);
      }
    },
    markAllAsRead: (state, action: PayloadAction<{ userId?: string; role?: string } | undefined>) => {
      const filter = action.payload;
      state.notifications.forEach((n) => {
        if (!filter) {
          n.isRead = true;
        } else if (filter.role === 'admin') {
          if (n.target === 'admin') n.isRead = true;
        } else if (filter.userId) {
          if (n.target === 'client' && n.userId === filter.userId) n.isRead = true;
        }
      });
      saveState(state.notifications);
    },
    clearNotifications: (state, action: PayloadAction<{ userId?: string; role?: string } | undefined>) => {
      const filter = action.payload;
      if (!filter) {
        state.notifications = [];
      } else if (filter.role === 'admin') {
        state.notifications = state.notifications.filter((n) => n.target !== 'admin');
      } else if (filter.userId) {
        state.notifications = state.notifications.filter(
          (n) => !(n.target === 'client' && n.userId === filter.userId)
        );
      }
      saveState(state.notifications);
    },
    syncNotifications: (
      state,
      action: PayloadAction<{
        orders: any[];
        appointments: any[];
        products: any[];
        userId?: string;
        role?: 'admin' | 'user' | 'technician';
      }>
    ) => {
      const { orders, appointments, products, userId, role } = action.payload;
      let updated = false;

      if (role === 'admin') {
        // 1. Sync out-of-stock products
        products.forEach((product) => {
          if (product.stock === 0) {
            const id = `stock-${product._id}`;
            if (!state.notifications.some((n) => n.id === id)) {
              state.notifications.unshift({
                id,
                type: 'stock',
                title: 'Stock Out Alert',
                message: `Product "${product.title}" is out of stock!`,
                isRead: false,
                link: '/admin/products',
                createdAt: new Date().toISOString(),
                target: 'admin',
              });
              updated = true;
            }
          }
        });

        // 2. Sync pending orders
        orders.forEach((order) => {
          if (order.orderStatus === 'pending' || order.orderStatus === 'processing') {
            const id = `order-${order._id}`;
            if (!state.notifications.some((n) => n.id === id)) {
              state.notifications.unshift({
                id,
                type: 'order',
                title: 'New Order Placed',
                message: `Order #${order.orderNumber || order._id.slice(-6).toUpperCase()} is awaiting review.`,
                isRead: false,
                link: '/admin/orders',
                createdAt: order.createdAt || new Date().toISOString(),
                target: 'admin',
              });
              updated = true;
            }
          }
        });

        // 3. Sync pending appointments
        appointments.forEach((appt) => {
          if (appt.status === 'pending') {
            const id = `appt-${appt._id}`;
            if (!state.notifications.some((n) => n.id === id)) {
              state.notifications.unshift({
                id,
                type: 'appointment',
                title: 'New Appointment Booked',
                message: `Appointment for ${appt.contactName} (${appt.serviceType}) needs review.`,
                isRead: false,
                link: '/admin/appointments',
                createdAt: appt.createdAt || new Date().toISOString(),
                target: 'admin',
              });
              updated = true;
            }
          }
        });
      } else if (userId) {
        // 1. Sync user's orders
        orders.forEach((order) => {
          const id = `order-client-${order._id}`;
          if (!state.notifications.some((n) => n.id === id)) {
            state.notifications.unshift({
              id,
              type: 'order',
              title: `Order Status Update`,
              message: `Your Order #${order.orderNumber || order._id.slice(-6).toUpperCase()} status is: ${order.orderStatus}.`,
              isRead: false,
              link: `/dashboard/orders`,
              createdAt: order.createdAt || new Date().toISOString(),
              target: 'client',
              userId,
            });
            updated = true;
          }
        });

        // 2. Sync user's appointments
        appointments.forEach((appt) => {
          const id = `appt-client-${appt._id}`;
          if (!state.notifications.some((n) => n.id === id)) {
            state.notifications.unshift({
              id,
              type: 'appointment',
              title: `Appointment Status`,
              message: `Your appointment for ${appt.serviceType} is: ${appt.status}.`,
              isRead: false,
              link: `/dashboard/appointments`,
              createdAt: appt.createdAt || new Date().toISOString(),
              target: 'client',
              userId,
            });
            updated = true;
          }
        });
      }

      if (updated) {
        saveState(state.notifications);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle placing order in session
      .addCase(placeOrder.fulfilled, (state, action) => {
        const order = action.payload.data;
        if (!order) return;

        // Admin Notification
        const adminId = `order-admin-${order._id}`;
        if (!state.notifications.some((n) => n.id === adminId)) {
          state.notifications.unshift({
            id: adminId,
            type: 'order',
            title: 'New Order Placed',
            message: `Order #${order.orderNumber || order._id.slice(-6).toUpperCase()} was placed successfully.`,
            isRead: false,
            link: '/admin/orders',
            createdAt: new Date().toISOString(),
            target: 'admin',
          });
        }

        // Client Notification
        const clientId = `order-client-${order._id}`;
        const uId = typeof order.user === 'object' ? order.user._id : order.user;
        if (uId && !state.notifications.some((n) => n.id === clientId)) {
          state.notifications.unshift({
            id: clientId,
            type: 'order',
            title: 'Order Placed Successfully',
            message: `Your Order #${order.orderNumber || order._id.slice(-6).toUpperCase()} has been placed.`,
            isRead: false,
            link: '/dashboard/orders',
            createdAt: new Date().toISOString(),
            target: 'client',
            userId: uId,
          });
        }

        saveState(state.notifications);
      })
      // Handle booking appointment in session
      .addCase(bookAppointment.fulfilled, (state, action) => {
        const appt = action.payload.data;
        if (!appt) return;

        // Admin Notification
        const adminId = `appt-admin-${appt._id}`;
        if (!state.notifications.some((n) => n.id === adminId)) {
          state.notifications.unshift({
            id: adminId,
            type: 'appointment',
            title: 'New Appointment Booked',
            message: `Appointment for ${appt.contactName} (${appt.serviceType}) was successfully booked.`,
            isRead: false,
            link: '/admin/appointments',
            createdAt: new Date().toISOString(),
            target: 'admin',
          });
        }

        // Client Notification
        const clientId = `appt-client-${appt._id}`;
        const uId = typeof appt.user === 'object' ? appt.user._id : appt.user;
        if (uId && !state.notifications.some((n) => n.id === clientId)) {
          state.notifications.unshift({
            id: clientId,
            type: 'appointment',
            title: 'Appointment Booked Successfully',
            message: `Your appointment for ${appt.serviceType} has been booked.`,
            isRead: false,
            link: '/dashboard/appointments',
            createdAt: new Date().toISOString(),
            target: 'client',
            userId: uId,
          });
        }

        saveState(state.notifications);
      })
      // Handle stock updates in session
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const { id: productId, stock } = action.payload;
        if (stock === 0) {
          const id = `stock-${productId}`;
          if (!state.notifications.some((n) => n.id === id)) {
            state.notifications.unshift({
              id,
              type: 'stock',
              title: 'Stock Out Alert',
              message: `Product stock reached 0. Action required.`,
              isRead: false,
              link: '/admin/products',
              createdAt: new Date().toISOString(),
              target: 'admin',
            });
            saveState(state.notifications);
          }
        }
      });
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  syncNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
