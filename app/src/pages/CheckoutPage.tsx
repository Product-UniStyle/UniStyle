import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ChevronLeft, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/ToastContainer';
import { api, ApiError } from '@/lib/api';
import { COUNTRIES } from '@/data/countries';

export function CheckoutPage() {
  const { selectedItems: items, selectedSubtotal: subtotal, discount, removeItems } = useCart();
  const { user, isAuthenticated, refreshOrders } = useAuth();
  const navigate = useNavigate();

  const [shippingData, setShippingData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address1: '',
    address2: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
  });
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [processing, setProcessing] = useState(false);
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  const shippingCost = shippingMethod === 'express' ? 15 : subtotal > 100 ? 0 : 8;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shippingCost + tax;

  const validateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shippingData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) errors.email = 'Enter a valid email';
    if (!shippingData.firstName.trim()) errors.firstName = 'First name is required';
    if (!shippingData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!shippingData.address1.trim()) errors.address1 = 'Address is required';
    if (!shippingData.city.trim()) errors.city = 'City is required';
    if (!shippingData.country.trim()) errors.country = 'Country is required';
    if (!shippingData.postalCode.trim()) errors.postalCode = 'Postal code is required';
    else if (!/^\d{3,10}$/.test(shippingData.postalCode.trim())) errors.postalCode = 'Postal code must be numbers only';
    if (!shippingData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\d{10,15}$/.test(shippingData.phone.replace(/[\s-]/g, ''))) errors.phone = 'Enter a valid phone number (at least 10 digits)';
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to place an order', 'error');
      navigate('/account');
      return;
    }

    if (!validateShipping()) {
      showToast('Please fill in all required shipping fields', 'error');
      return;
    }

    setProcessing(true);
    try {
      const orderedItemIds = items.map(item => item.id);
      const { orderId, redirectUrl, url } = await api.createCheckoutSession({
        shippingAddress: {
          fullName: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
          line1: shippingData.address1,
          line2: shippingData.address2 || undefined,
          city: shippingData.city,
          postalCode: shippingData.postalCode,
          country: shippingData.country,
          phone: shippingData.phone || undefined,
        },
        itemIds: orderedItemIds,
      });

      if (url) {
        // Real Stripe checkout: nothing is paid yet, so don't claim success or
        // clear the cart until the webhook actually confirms payment.
        window.location.href = url;
      } else {
        removeItems(orderedItemIds);
        showToast('Order placed successfully!');
        await refreshOrders();
        navigate(redirectUrl || `/account?order=success&orderId=${orderId}`);
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to place order', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mt-[72px] min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-sm text-[#666] mb-6">Add some items to proceed to checkout.</p>
          <Link to="/shop" className="inline-block bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-8 py-4 hover:bg-[#333] transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[72px]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-[#1A1A1A] mb-8">
          <ChevronLeft size={16} /> Back to Cart
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-10">Checkout</h1>

        <div className="max-w-[720px]">
            <div>
                <h2 className="text-lg font-bold mb-6">Contact Information</h2>
                <div className="mb-6">
                  <input
                    type="email"
                    placeholder="Email"
                    value={shippingData.email}
                    onChange={e => { setShippingData({ ...shippingData, email: e.target.value }); setShippingErrors({ ...shippingErrors, email: '' }); }}
                    className={`w-full border px-4 py-3 text-sm outline-none transition-colors ${shippingErrors.email ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`}
                  />
                  {shippingErrors.email && <p className="text-xs text-red-600 mt-1">{shippingErrors.email}</p>}
                </div>

                <h2 className="text-lg font-bold mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <input placeholder="First Name" value={shippingData.firstName} onChange={e => { setShippingData({ ...shippingData, firstName: e.target.value }); setShippingErrors({ ...shippingErrors, firstName: '' }); }} className={`w-full border px-4 py-3 text-sm outline-none ${shippingErrors.firstName ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`} />
                    {shippingErrors.firstName && <p className="text-xs text-red-600 mt-1">{shippingErrors.firstName}</p>}
                  </div>
                  <div>
                    <input placeholder="Last Name" value={shippingData.lastName} onChange={e => { setShippingData({ ...shippingData, lastName: e.target.value }); setShippingErrors({ ...shippingErrors, lastName: '' }); }} className={`w-full border px-4 py-3 text-sm outline-none ${shippingErrors.lastName ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`} />
                    {shippingErrors.lastName && <p className="text-xs text-red-600 mt-1">{shippingErrors.lastName}</p>}
                  </div>
                </div>
                <div className="mb-4">
                  <input placeholder="Address" value={shippingData.address1} onChange={e => { setShippingData({ ...shippingData, address1: e.target.value }); setShippingErrors({ ...shippingErrors, address1: '' }); }} className={`w-full border px-4 py-3 text-sm outline-none ${shippingErrors.address1 ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`} />
                  {shippingErrors.address1 && <p className="text-xs text-red-600 mt-1">{shippingErrors.address1}</p>}
                </div>
                <input placeholder="Apartment, suite, etc. (optional)" value={shippingData.address2} onChange={e => setShippingData({ ...shippingData, address2: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-4 outline-none focus:border-[#1A1A1A]" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <input placeholder="City" value={shippingData.city} onChange={e => { setShippingData({ ...shippingData, city: e.target.value }); setShippingErrors({ ...shippingErrors, city: '' }); }} className={`w-full border px-4 py-3 text-sm outline-none ${shippingErrors.city ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`} />
                    {shippingErrors.city && <p className="text-xs text-red-600 mt-1">{shippingErrors.city}</p>}
                  </div>
                  <div>
                    <select
                      value={shippingData.country}
                      onChange={e => { setShippingData({ ...shippingData, country: e.target.value }); setShippingErrors({ ...shippingErrors, country: '' }); }}
                      className={`w-full border px-4 py-3 text-sm outline-none bg-white ${shippingErrors.country ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`}
                    >
                      <option value="">Country</option>
                      {COUNTRIES.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    {shippingErrors.country && <p className="text-xs text-red-600 mt-1">{shippingErrors.country}</p>}
                  </div>
                  <div>
                    <input placeholder="Postal Code" inputMode="numeric" value={shippingData.postalCode} onChange={e => { setShippingData({ ...shippingData, postalCode: e.target.value.replace(/\D/g, '') }); setShippingErrors({ ...shippingErrors, postalCode: '' }); }} className={`w-full border px-4 py-3 text-sm outline-none ${shippingErrors.postalCode ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`} />
                    {shippingErrors.postalCode && <p className="text-xs text-red-600 mt-1">{shippingErrors.postalCode}</p>}
                  </div>
                </div>
                <div className="mb-8">
                  <input placeholder="Phone *" inputMode="numeric" value={shippingData.phone} onChange={e => { setShippingData({ ...shippingData, phone: e.target.value.replace(/\D/g, '') }); setShippingErrors({ ...shippingErrors, phone: '' }); }} className={`w-full border px-4 py-3 text-sm outline-none ${shippingErrors.phone ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`} />
                  {shippingErrors.phone && <p className="text-xs text-red-600 mt-1">{shippingErrors.phone}</p>}
                </div>

                <h2 className="text-lg font-bold mb-6">Shipping Method</h2>
                <div className="space-y-3 mb-8">
                  <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${shippingMethod === 'standard' ? 'border-[#1A1A1A] bg-[#F5F5F5]' : 'border-[#E5E5E5]'}`}>
                    <div className="flex items-center gap-3">
                      <Truck size={18} />
                      <div>
                        <p className="text-sm font-medium">Standard Shipping</p>
                        <p className="text-xs text-[#999]">5-7 business days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{subtotal > 100 ? 'FREE' : 'AED 8.00'}</span>
                      <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="accent-[#1A1A1A]" />
                    </div>
                  </label>
                  <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${shippingMethod === 'express' ? 'border-[#1A1A1A] bg-[#F5F5F5]' : 'border-[#E5E5E5]'}`}>
                    <div className="flex items-center gap-3">
                      <Truck size={18} />
                      <div>
                        <p className="text-sm font-medium">Express Shipping</p>
                        <p className="text-xs text-[#999]">2-3 business days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">AED 15.00</span>
                      <input type="radio" name="shipping" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="accent-[#1A1A1A]" />
                    </div>
                  </label>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#666] mb-6">
                  <Lock size={14} />
                  <span>You'll enter your card details securely on Stripe's payment page next.</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  className="w-full bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-[0.08em] py-4 hover:bg-[#333] transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : `Place Order — AED ${total.toFixed(2)}`}
                </button>

                <div className="grid grid-cols-4 gap-2 mt-5 w-full">
                  <div className="h-11 flex items-center justify-center gap-1.5 border border-[#E5E5E5] rounded-sm text-[#666]">
                    <Lock size={14} />
                    <span className="text-[10px] font-semibold leading-tight">256-bit<br />SSL</span>
                  </div>
                  {[
                    { src: '/payment/visa.svg', alt: 'Visa' },
                    { src: '/payment/mastercard.svg', alt: 'Mastercard' },
                    { src: '/payment/amex.svg', alt: 'American Express' },
                  ].map(b => (
                    <div key={b.alt} className="h-11 p-1.5 flex items-center justify-center border border-[#E5E5E5] rounded-sm overflow-hidden">
                      <img src={b.src} alt={b.alt} className="h-full w-full object-contain rounded-[2px]" />
                    </div>
                  ))}
                </div>
              </div>
        </div>
      </div>
    </div>
  );
}
