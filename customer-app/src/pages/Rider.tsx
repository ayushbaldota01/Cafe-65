import { useState, useEffect } from 'react';
import { MapPin, Navigation, CheckCircle2, Bike } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';

export function Rider() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [wakeLock, setWakeLock] = useState<any>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*').in('status', ['preparing', 'out_for_delivery']);
      if (data) setOrders(data as Order[]);
    };
    fetchOrders();

    const channel = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const lock = await (navigator as any).wakeLock.request('screen');
        setWakeLock(lock);
      }
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLock !== null) {
      wakeLock.release().then(() => {
        setWakeLock(null);
      });
    }
  };

  const startDelivery = async (order: Order) => {
    setActiveOrder(order);
    await supabase.from('orders').update({
      status: 'out_for_delivery'
    }).eq('id', order.id);

    await requestWakeLock();

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await supabase.from('orders').update({
          riderLocation: { lat: latitude, lng: longitude }
        }).eq('id', order.id);
      },
      (error) => console.error("Error watching position", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    setWatchId(id);
  };

  const finishDelivery = async (order: Order) => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    releaseWakeLock();
    setActiveOrder(null);
    
    await supabase.from('orders').update({
      status: 'delivered',
      riderLocation: null
    }).eq('id', order.id);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8 pb-20">
      <h1 className="text-3xl font-black flex items-center gap-3 text-gray-900 mt-4">
        <div className="bg-brand-100 p-3 rounded-2xl">
          <Bike className="w-8 h-8 text-brand-600" />
        </div>
        Rider Dashboard
      </h1>
      
      {activeOrder ? (
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-brand-100 border-2 border-brand-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-brand-500 text-white px-5 py-2 rounded-bl-2xl font-bold text-sm shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            ACTIVE
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-6 mt-2">Current Delivery</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 shrink-0">
                <MapPin className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Destination</p>
                <p className="font-semibold text-gray-900 text-lg leading-snug">{activeOrder.customer_address.text}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
               <div>
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Reference</p>
                 <p className="font-mono font-black text-gray-900 text-lg">#{activeOrder.id.slice(-6)}</p>
               </div>
            </div>
          </div>
          
          <button 
            onClick={() => finishDelivery(activeOrder)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
          >
            <CheckCircle2 className="w-7 h-7" />
            Mark as Delivered
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Assigned Orders</h2>
            <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
              {orders.length}
            </span>
          </div>
          
          {orders.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
               <div className="bg-gray-50 p-6 rounded-full mb-4">
                 <Bike className="w-12 h-12 text-gray-300" />
               </div>
               <p className="text-xl font-black text-gray-500">No active orders</p>
               <p className="text-gray-400 mt-2 font-medium">Waiting for new assignments...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-50 p-3 rounded-xl text-brand-600 shrink-0 border border-brand-100">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg mb-1">#{order.id.slice(-6)}</p>
                      <p className="text-gray-600 font-medium line-clamp-2 leading-snug text-sm">{order.customer_address.text}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => startDelivery(order)}
                    className="shrink-0 w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-brand-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-5 h-5" />
                    Start
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
