import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  deliveryFee: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryFee: 49,
      
      addItem: (newItem) => set((state) => {
        const existingIndex = state.items.findIndex(
          (i) => i.item_id === newItem.item_id && 
                 i.variant_selected === newItem.variant_selected &&
                 JSON.stringify(i.addons_selected.sort()) === JSON.stringify(newItem.addons_selected.sort())
        );

        if (existingIndex >= 0) {
          const newItems = [...state.items];
          newItems[existingIndex].qty += newItem.qty;
          const pricePerUnit = newItems[existingIndex].line_total / (newItems[existingIndex].qty - newItem.qty);
          newItems[existingIndex].line_total = pricePerUnit * newItems[existingIndex].qty;
          return { items: newItems };
        }
        
        return { items: [...state.items, newItem] };
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      
      updateQty: (id, qty) => set((state) => ({
        items: state.items.map(i => {
          if (i.id === id) {
            const pricePerUnit = i.line_total / i.qty;
            return { ...i, qty, line_total: pricePerUnit * qty };
          }
          return i;
        })
      })),
      
      clearCart: () => set({ items: [] }),
      
      getSubtotal: () => get().items.reduce((sum, item) => sum + item.line_total, 0),
      
      getTotal: () => get().getSubtotal() + get().deliveryFee
    }),
    {
      name: 'cafe65-cart',
    }
  )
);
