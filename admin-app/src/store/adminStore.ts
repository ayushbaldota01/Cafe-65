import { create } from 'zustand';
import type { Item, Order } from '../types';

interface AdminState {
  items: Item[];
  orders: Order[];
  
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  toggleItemAvailability: (id: string) => void;
  
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (id: string, status: Order['status'], details?: { prepTime?: number, eta?: string }) => void;
  
  lastNewOrderId: string | null;
  clearNewOrderAlert: () => void;
  
  simulateNewOrder: () => void;
}

const initialItems: Item[] = [
  {
    id: "pizza-margherita",
    name: "Margherita Pizza",
    category: "Pizza",
    description: "Classic cheese and tomato pizza.",
    base_price: 179,
    image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=400",
    is_available: true,
    variants: [
      { name: "8in", price: 179 },
      { name: "10in", price: 249 },
      { name: "12in", price: 360 }
    ],
    variant_type: "size",
    addons: []
  },
  {
    id: "fries-classic",
    name: "Classic Fries",
    category: "Fries",
    description: "Crispy salted fries.",
    base_price: 99,
    image_url: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=400",
    is_available: true,
    variants: [],
    variant_type: null,
    addons: [
      { name: "Mayo", price_delta: 30 },
      { name: "Cheese Dip", price_delta: 40 }
    ]
  }
];

export const useAdminStore = create<AdminState>((set) => ({
  items: initialItems,
  orders: [],
  lastNewOrderId: null,
  
  setItems: (items) => set({ items }),
  addItem: (item) => set(state => ({ items: [...state.items, item] })),
  updateItem: (id, updates) => set(state => ({
    items: state.items.map(i => i.id === id ? { ...i, ...updates } : i)
  })),
  toggleItemAvailability: (id) => set(state => ({
    items: state.items.map(i => i.id === id ? { ...i, is_available: !i.is_available } : i)
  })),
  
  setOrders: (orders) => set({ orders }),
  updateOrderStatus: (id, status, details) => set(state => {
    const updated = state.orders.map(o => {
      if (o.id === id) {
        const timestampKey = `${status}_at` as keyof Order['status_timestamps'];
        const updatedOrder = { 
          ...o, 
          status,
          status_timestamps: { ...o.status_timestamps, [timestampKey]: new Date().toISOString() }
        };
        if (details?.prepTime) updatedOrder.prep_time_estimate_mins = details.prepTime;
        if (details?.eta) updatedOrder.eta_delivery = details.eta;
        return updatedOrder;
      }
      return o;
    });
    return { orders: updated };
  }),
  
  clearNewOrderAlert: () => set({ lastNewOrderId: null }),
  
  simulateNewOrder: () => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      customer_id: "mock-customer-1",
      items: [
        {
          id: `cart-${Date.now()}`,
          item_id: "pizza-margherita",
          item: initialItems[0],
          variant_selected: "10in",
          addons_selected: [],
          qty: 1,
          line_total: 249
        }
      ],
      subtotal: 249,
      delivery_fee: 50,
      total: 299,
      customer_address: { text: "123 Main St", lat: 12.971, lng: 77.594 },
      status: 'placed',
      status_timestamps: { placed_at: new Date().toISOString() },
      payment_method: 'cod',
      payment_status: 'pending'
    };
    set(state => ({
      orders: [...state.orders, newOrder],
      lastNewOrderId: newOrder.id
    }));
  }
}));
