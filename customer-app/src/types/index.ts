export interface Item {
  id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  image_url: string;
  is_available: boolean;
  variants: { name: string; price: number }[];
  variant_type: "size" | "base_choice" | "type" | null;
  addons: { name: string; price_delta: number }[];
}

export interface CartItem {
  id: string;
  item_id: string;
  item: Item;
  variant_selected: string | null;
  addons_selected: string[];
  qty: number;
  line_total: number;
}

export interface Order {
  id: string;
  customer_id: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  customer_address: { text: string; lat: number; lng: number };
  status: 'placed' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  status_timestamps: any;
  prep_time_estimate_mins?: number;
  eta_delivery?: any;
  payment_method: 'cod' | 'razorpay';
  payment_status: string;
}
