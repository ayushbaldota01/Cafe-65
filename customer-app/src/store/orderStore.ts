import { create } from 'zustand';
import type { Order } from '../types';

interface OrderState {
  orders: Order[];
  placeOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], location?: { lat: number, lng: number }) => void;
  activeDeliveryLocation: { [orderId: string]: { lat: number, lng: number } };
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  activeDeliveryLocation: {},
  placeOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrderStatus: (orderId, status, location) => set((state) => {
    const newOrders = state.orders.map(o => o.id === orderId ? { ...o, status } : o);
    const newLocs = { ...state.activeDeliveryLocation };
    if (location) {
      newLocs[orderId] = location;
    }
    return { orders: newOrders, activeDeliveryLocation: newLocs };
  })
}));
