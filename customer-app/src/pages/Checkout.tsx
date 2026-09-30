import { useState, useRef, useMemo } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import { useNavigate } from 'react-router-dom';
import type { Order } from '../types';
import { MapPin, LocateFixed } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';

const CAFE_LAT = 18.038899;
const CAFE_LNG = 75.16045;
// const MAX_RADIUS_KM = 5;

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
//   const R = 6371;
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;
//   const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//     Math.sin(dLon/2) * Math.sin(dLon/2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//   return R * c;
// }

export function Checkout() {
  const { items, getSubtotal, getTotal, deliveryFee, clearCart } = useCartStore();
  const { user, login } = useAuthStore();
  const { placeOrder } = useOrderStore();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'checkout'>(user ? 'checkout' : 'phone');
  
  const [houseNumber, setHouseNumber] = useState('');
  const [addressText, setAddressText] = useState('');
  const [position, setPosition] = useState({lat: CAFE_LAT, lng: CAFE_LNG});

  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddressText(data.display_name);
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e);
    }
  };
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [isPlacing, setIsPlacing] = useState(false);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition({lat: pos.coords.latitude, lng: pos.coords.longitude});
        fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude);
      }, () => alert("Could not get location"));
    }
  };

  function DraggableMarker() {
    const markerRef = useRef<L.Marker>(null);
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            const pos = marker.getLatLng();
            setPosition(pos);
            fetchAddressFromCoords(pos.lat, pos.lng);
          }
        },
      }),
      [],
    );
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        fetchAddressFromCoords(e.latlng.lat, e.latlng.lng);
      },
    });

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
      />
    );
  }

  const handleSendOtp = () => {
    if (phone.length >= 10) setStep('otp');
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') {
      login(phone);
      setStep('checkout');
    } else {
      alert("Invalid OTP. Use 123456");
    }
  };

  const handlePlaceOrder = async () => {
    if (position.lat === CAFE_LAT && position.lng === CAFE_LNG) {
      alert("Please pin your exact delivery location on the map. The map must not be left at the cafe's default location.");
      return;
    }
    if (!houseNumber) {
      alert("Please enter your House / Flat / Block No.");
      return;
    }
    if (!addressText) {
      alert("Please wait for your address to be verified from the map pin.");
      return;
    }
    
    // const distance = getDistance(CAFE_LAT, CAFE_LNG, position.lat, position.lng);
    // REMOVED FOR TESTING
    // if (distance > MAX_RADIUS_KM) {
    //   alert(`Sorry, your location is ${distance.toFixed(1)}km away. We only deliver within ${MAX_RADIUS_KM}km of Cafe.`);
    //   return;
    // }
    
    setIsPlacing(true);
    
    try {
      const order: Order = {
        id: `ORD-${Date.now()}`,
        customer_id: user!.uid,
        items: items,
        subtotal: getSubtotal(),
        delivery_fee: deliveryFee,
        total: getTotal(),
        customer_address: {
          text: `${houseNumber}, ${addressText}`,
          lat: position.lat,
          lng: position.lng
        },
        status: 'placed',
        status_timestamps: { placed_at: new Date().toISOString() },
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid'
      };
      
      const { error } = await supabase.from('orders').insert(order);
      if (error) throw error;
      
      placeOrder(order);
      clearCart();
      setIsPlacing(false);
      navigate(`/tracking/${order.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
      setIsPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-brand-600 font-medium">
          Go back to menu
        </button>
      </div>
    );
  }

  if (step === 'phone') {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border">
        <h2 className="text-2xl font-bold mb-6">Login to Checkout</h2>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <input 
          type="tel" 
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Enter 10-digit number"
          className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-brand-500 focus:border-brand-500"
        />
        <button 
          onClick={handleSendOtp}
          className="w-full mt-6 bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 transition-colors"
        >
          Send OTP
        </button>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border">
        <h2 className="text-2xl font-bold mb-6">Verify OTP</h2>
        <p className="text-sm text-gray-500 mb-4">Code sent to {phone} (use 123456)</p>
        <input 
          type="text" 
          value={otp}
          onChange={e => setOtp(e.target.value)}
          placeholder="6-digit OTP"
          className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-brand-500 focus:border-brand-500 tracking-widest text-center text-xl"
        />
        <button 
          onClick={handleVerifyOtp}
          className="w-full mt-6 bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 transition-colors"
        >
          Verify & Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
      
      {/* Address */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">House / Flat / Block No. <span className="text-red-500">*</span></label>
            <input 
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="e.g. 101, XYZ Apartment"
              className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verified Map Location</label>
            <textarea 
              readOnly
              value={addressText}
              placeholder="Move the map pin or click 'Use My Location' to auto-fill your exact verified address..."
              className="w-full border-gray-300 rounded-lg shadow-sm p-3 border bg-gray-50 text-gray-600 min-h-[80px]"
            />
          </div>
          
            <div className="flex justify-between items-center mb-2 mt-4">
              <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" />
                Pin Your Delivery Location
              </label>
              <button 
                onClick={handleUseMyLocation}
                className="text-sm bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold py-1.5 px-3 rounded-full flex items-center gap-2 transition-colors active:scale-95"
              >
                <LocateFixed className="w-4 h-4" />
                Use My Location
              </button>
            </div>
            <div className="h-[300px] bg-gray-100 rounded-2xl overflow-hidden border-2 border-brand-100 shadow-inner relative z-0">
              <MapContainer center={[CAFE_LAT, CAFE_LNG]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <DraggableMarker />
              </MapContainer>
            </div>
            <p className="text-xs font-semibold text-gray-500 mt-3 flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>
               Drag the pin to your exact location (No distance limit for testing).
            </p>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold mb-4">Payment Method</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 data-[selected=true]:border-brand-500 data-[selected=true]:bg-brand-50" data-selected={paymentMethod === 'razorpay'}>
            <input 
              type="radio" 
              name="payment" 
              checked={paymentMethod === 'razorpay'} 
              onChange={() => setPaymentMethod('razorpay')}
              className="text-brand-500"
            />
            <span className="font-medium">Pay Online (Razorpay)</span>
          </label>
          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 data-[selected=true]:border-brand-500 data-[selected=true]:bg-brand-50" data-selected={paymentMethod === 'cod'}>
            <input 
              type="radio" 
              name="payment" 
              checked={paymentMethod === 'cod'} 
              onChange={() => setPaymentMethod('cod')}
              className="text-brand-500"
            />
            <span className="font-medium">Cash on Delivery</span>
          </label>
        </div>
      </div>

      {/* Summary & Place Order */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({items.length} items)</span>
            <span>₹{getSubtotal()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>₹{deliveryFee}</span>
          </div>
          <div className="flex justify-between font-bold text-xl pt-4 border-t mt-4">
            <span>Total to Pay</span>
            <span>₹{getTotal()}</span>
          </div>
        </div>
        
        <button 
          onClick={handlePlaceOrder}
          disabled={isPlacing}
          className="w-full bg-brand-600 disabled:bg-brand-400 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-colors flex justify-center items-center gap-2"
        >
          {isPlacing ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
