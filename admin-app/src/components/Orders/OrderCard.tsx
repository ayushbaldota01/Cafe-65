import type { Order } from '../../types';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';

interface Props {
  order: Order;
}

export function OrderCard({ order }: Props) {
  const updateOrderStatus = async (id: string, status: string, details?: any) => {
    const timestampKey = `${status}_at`;
    const updates: any = {
      status,
      status_timestamps: { ...order.status_timestamps, [timestampKey]: new Date().toISOString() }
    };
    if (details?.prepTime) updates.prep_time_estimate_mins = details.prepTime;
    if (details?.eta) updates.eta_delivery = details.eta;

    await supabase.from('orders').update(updates).eq('id', id);
  };
  const [timeAgo, setTimeAgo] = useState('');
  
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [prepTime, setPrepTime] = useState(15);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      if (order.status_timestamps?.placed_at) {
        setTimeAgo(formatDistanceToNow(new Date(order.status_timestamps.placed_at), { addSuffix: true }));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [order.status_timestamps]);

  const handleAccept = () => {
    updateOrderStatus(order.id, 'accepted', { prepTime });
    setShowPrepModal(false);
  };

  const handleReject = () => {
    const reason = prompt("Enter reason for rejection:");
    if (reason) {
      updateOrderStatus(order.id, 'cancelled');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">#{order.id.slice(-6)}</h3>
          <p className="text-sm text-gray-500">{order.customer_address.text}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-brand-600">{timeAgo}</div>
          <span className="inline-block px-3 py-1 mt-1 bg-gray-100 text-gray-700 font-bold rounded-full text-xs uppercase tracking-wider">
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="border-t border-b py-4 my-4 space-y-3">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between">
            <div>
              <span className="font-bold">{item.qty}x</span> {item.item.name}
              {item.variant_selected && <span className="text-sm text-gray-500 ml-2">({item.variant_selected})</span>}
              {item.addons_selected.length > 0 && (
                <div className="text-sm text-gray-500 ml-6">+ {item.addons_selected.join(', ')}</div>
              )}
            </div>
            <div className="font-medium">₹{item.line_total}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-500">Total</span>
        <span className="text-2xl font-bold">₹{order.total}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {order.status === 'placed' && (
          <>
            <button 
              onClick={() => setShowPrepModal(true)}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl min-h-[56px] text-lg transition-colors"
            >
              Accept
            </button>
            <button 
              onClick={handleReject}
              className="px-6 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-4 rounded-xl min-h-[56px] text-lg transition-colors"
            >
              Reject
            </button>
          </>
        )}
        
        {order.status === 'accepted' && (
          <button 
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl min-h-[56px] text-lg transition-colors"
          >
            Start Preparing
          </button>
        )}
        
        {order.status === 'preparing' && (
          <button 
            onClick={() => setShowConfirmModal(true)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl min-h-[56px] text-lg transition-colors"
          >
            Mark Out for Delivery
          </button>
        )}
        
        {order.status === 'out_for_delivery' && (
          <div className="w-full space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-900">ETA: {order.eta_delivery || 'Calculating...'}</div>
                <div className="text-sm text-blue-700">Delivery person is on the way</div>
              </div>
              <div className="w-16 h-16 bg-blue-200 rounded-lg flex items-center justify-center text-blue-600 text-xs text-center font-medium">
                Map View
              </div>
            </div>
            <button 
              onClick={() => updateOrderStatus(order.id, 'delivered')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl min-h-[56px] text-lg transition-colors"
            >
              Mark Delivered
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPrepModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Set Prep Time</h3>
            <select 
              value={prepTime}
              onChange={(e) => setPrepTime(Number(e.target.value))}
              className="w-full p-4 text-lg border rounded-xl mb-6 min-h-[56px]"
            >
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={25}>25 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
            </select>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPrepModal(false)}
                className="flex-1 bg-gray-100 font-bold py-4 rounded-xl min-h-[56px]"
              >
                Cancel
              </button>
              <button 
                onClick={handleAccept}
                className="flex-1 bg-brand-600 text-white font-bold py-4 rounded-xl min-h-[56px]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">Confirm Dispatch</h3>
            <p className="text-gray-600 mb-6">Has the delivery person actually left the cafe? ETA calculation will trigger now.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 font-bold py-4 rounded-xl min-h-[56px]"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  updateOrderStatus(order.id, 'out_for_delivery', { eta: '15 mins' });
                  setShowConfirmModal(false);
                }}
                className="flex-1 bg-amber-500 text-white font-bold py-4 rounded-xl min-h-[56px]"
              >
                Yes, Dispatched
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
