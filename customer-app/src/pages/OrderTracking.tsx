import { useParams } from 'react-router-dom';
import { useOrderStore } from '../store/orderStore';
import { DeliveryMap } from '../components/Tracking/DeliveryMap';
import { useEffect } from 'react';
import { CheckCircle2, Circle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

const STATUS_ORDER = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];

export function OrderTracking() {
  const { orderId } = useParams();
  const { orders, updateOrderStatus } = useOrderStore();
  const order = orders.find(o => o.id === orderId);

  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
        const data = payload.new as any;
        updateOrderStatus(orderId, data.status, data.riderLocation);
      })
      .subscribe();

    supabase.from('orders').select('*').eq('id', orderId).single().then(({data}) => {
      if (data) {
        updateOrderStatus(orderId, data.status, data.riderLocation);
      }
    });

    return () => { supabase.removeChannel(channel); };
  }, [orderId, updateOrderStatus]);

  if (!order) {
    return <div className="p-8 text-center text-gray-500">Order not found.</div>;
  }

  const currentIdx = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-gray-900">Track Order #{order.id.slice(-6)}</h1>
      
      {/* Stepper */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="space-y-6">
          {STATUS_ORDER.map((status, index) => {
            const isCompleted = index <= currentIdx;
            const isCurrent = index === currentIdx;
            
            let Icon = Circle;
            if (isCompleted) Icon = CheckCircle2;
            
            return (
              <div key={status} className="flex items-center gap-4 relative">
                {/* Line connector */}
                {index < STATUS_ORDER.length - 1 && (
                  <div className={`absolute left-3 top-8 bottom-[-24px] w-0.5 ${index < currentIdx ? 'bg-brand-500' : 'bg-gray-200'}`} />
                )}
                
                <div className={`z-10 bg-white ${isCurrent ? 'text-brand-600' : isCompleted ? 'text-brand-500' : 'text-gray-300'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isCurrent ? 'text-brand-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {status.replace(/_/g, ' ').toUpperCase()}
                  </h3>
                  {isCurrent && status === 'out_for_delivery' && (
                    <p className="text-sm text-brand-600 mt-1 font-medium">Tracking Rider Location...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map (Only when out for delivery) */}
      {order.status === 'out_for_delivery' && (
        <div className="bg-white rounded-3xl shadow-lg border-2 border-brand-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-5 border-b bg-brand-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-brand-900">Live Tracking</h3>
            </div>
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
            </div>
          </div>
          <div className="h-[350px] relative z-0">
            <DeliveryMap orderId={order.id} destination={order.customer_address} />
          </div>
        </div>
      )}
    </div>
  );
}
