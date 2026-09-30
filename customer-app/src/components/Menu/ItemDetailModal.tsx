import { useState } from 'react';
import type { Item, CartItem } from '../../types';
import { X, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

interface Props {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailModal({ item, isOpen, onClose }: Props) {
  const [variant, setVariant] = useState<string | null>(
    item.variants?.length ? item.variants[0].name : null
  );
  const [addons, setAddons] = useState<Set<string>>(new Set());
  const [qty, setQty] = useState(1);
  const addItem = useCartStore(state => state.addItem);

  if (!isOpen) return null;

  // Calculate live price
  let currentPrice = item.base_price;
  if (variant && item.variants) {
    const v = item.variants.find(v => v.name === variant);
    if (v && item.variant_type === 'size') {
      currentPrice = v.price;
    }
  }
  
  let addonsTotal = 0;
  addons.forEach(addonName => {
    const a = item.addons?.find(x => x.name === addonName);
    if (a) addonsTotal += a.price_delta;
  });

  const livePrice = (currentPrice + addonsTotal) * qty;

  const toggleAddon = (name: string) => {
    const next = new Set(addons);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setAddons(next);
  };

  const handleAddToCart = () => {
    if (item.variant_type && item.variants?.length && !variant) {
      alert("Please select a variant");
      return;
    }
    
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      item_id: item.id,
      item: item,
      variant_selected: variant,
      addons_selected: Array.from(addons),
      qty,
      line_total: livePrice
    };
    
    addItem(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white w-full sm:w-[500px] max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in">
        
        {/* Header image */}
        <div className="relative h-48 sm:h-64 flex-shrink-0">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 p-2 rounded-full backdrop-blur-sm"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <p className="text-gray-500 mt-2">{item.description}</p>
          
          {/* Variants */}
          {item.variants && item.variants.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Choice of {item.variant_type === 'size' ? 'Size' : 'Option'}</h3>
              <div className="space-y-3">
                {item.variants.map(v => (
                  <label key={v.name} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 data-[selected=true]:border-brand-500 data-[selected=true]:bg-brand-50" data-selected={variant === v.name}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="variant" 
                        className="text-brand-500 focus:ring-brand-500"
                        checked={variant === v.name}
                        onChange={() => setVariant(v.name)}
                      />
                      <span className="font-medium">{v.name}</span>
                    </div>
                    {item.variant_type === 'size' && <span>₹{v.price}</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {item.addons && item.addons.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Add-ons</h3>
              <div className="space-y-3">
                {item.addons.map(a => (
                  <label key={a.name} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 data-[selected=true]:border-brand-500" data-selected={addons.has(a.name)}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="text-brand-500 focus:ring-brand-500 rounded"
                        checked={addons.has(a.name)}
                        onChange={() => toggleAddon(a.name)}
                      />
                      <span className="font-medium">{a.name}</span>
                    </div>
                    <span>+₹{a.price_delta}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Qty */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-xl font-bold">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl flex items-center justify-between px-6 transition-colors"
          >
            <span>Add to Cart</span>
            <span>₹{livePrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
