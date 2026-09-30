import { useAdminStore } from '../store/adminStore';
import { OrderCard } from '../components/Orders/OrderCard';
import { BugPlay } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function Dashboard() {
  const { orders, simulateNewOrder, lastNewOrderId, clearNewOrderAlert } = useAdminStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeStatuses = ['placed', 'accepted', 'preparing', 'out_for_delivery'];
  const activeOrders = orders
    .filter(o => activeStatuses.includes(o.status))
    .sort((a, b) => new Date(a.status_timestamps.placed_at).getTime() - new Date(b.status_timestamps.placed_at).getTime());

  const stats = {
    placed: orders.filter(o => o.status === 'placed').length,
    accepted: orders.filter(o => o.status === 'accepted').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  useEffect(() => {
    if (lastNewOrderId) {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      clearNewOrderAlert();
    }
  }, [lastNewOrderId, clearNewOrderAlert]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button 
          onClick={simulateNewOrder}
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <BugPlay className="w-4 h-4" /> Simulate New Order
        </button>
      </div>

      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

      {/* Basic Day View */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(stats).map(([status, count]) => (
          <div key={status} className="bg-white p-4 rounded-xl shadow-sm border text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{count}</div>
            <div className="text-xs uppercase tracking-wider font-semibold text-gray-500">
              {status.replace(/_/g, ' ')}
            </div>
          </div>
        ))}
      </div>

      {/* Live Order Queue */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          Live Order Queue
          <span className="bg-brand-100 text-brand-700 py-1 px-3 rounded-full text-sm">
            {activeOrders.length} Active
          </span>
        </h2>
        
        {activeOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border text-center text-gray-500 shadow-sm">
            No active orders at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
