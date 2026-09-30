import { useOrderStore } from '../store/orderStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function OrderHistory() {
  const { orders } = useOrderStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900">Please login</h2>
        <button onClick={() => navigate('/checkout')} className="mt-4 text-brand-600 font-medium">
          Go to Login
        </button>
      </div>
    );
  }

  const userOrders = orders.filter(o => o.customer_id === user.uid);

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Order History</h1>
      
      {userOrders.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">You have no past orders.</div>
      ) : (
        <div className="space-y-4">
          {userOrders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/tracking/${order.id}`)}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Order #{order.id.slice(-6)}</h3>
                  <p className="text-sm text-gray-500">{new Date(order.status_timestamps.placed_at).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-brand-100 text-brand-700'
                }`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {order.items.map(i => `${i.qty}x ${i.item.name}`).join(', ')}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between font-bold">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
