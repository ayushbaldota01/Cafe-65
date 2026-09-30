import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: Props) {
  const { items, updateQty, removeItem, getSubtotal, getTotal, deliveryFee } = useCartStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 transition-opacity">
      <div className="bg-white w-full md:w-96 h-full flex flex-col shadow-xl animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Your Cart
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              Your cart is empty
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 border-b pb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.item.name}</h4>
                  <p className="text-sm text-gray-500">
                    {item.variant_selected && `Size: ${item.variant_selected}`}
                    {item.addons_selected.length > 0 && ` | Add-ons: ${item.addons_selected.join(', ')}`}
                  </p>
                  <div className="mt-2 font-bold">₹{item.line_total}</div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm font-medium hover:underline">
                    Remove
                  </button>
                  <div className="flex items-center gap-3 border rounded-lg p-1 mt-2">
                    <button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))} className="p-1 hover:bg-gray-100 rounded">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1 hover:bg-gray-100 rounded">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{getSubtotal()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{getTotal()}</span>
              </div>
            </div>
            <button 
              onClick={() => {
                onClose();
                navigate('/checkout');
              }}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
