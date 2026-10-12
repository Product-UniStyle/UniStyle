import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Truck, Check, Pencil, Trash2, Plus, CreditCard, Percent, Wallet, Star, Banknote, Smartphone, Clock, Calendar, Landmark, Gift } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth, type Address } from '@/context/AuthContext';
import { showToast } from '@/components/ToastContainer';
import { api, ApiError } from '@/lib/api';
import { COUNTRIES } from '@/data/countries';

// Delivery estimate is computed from today using the same "5-7 business days"
// standard-shipping promise shown on the Payment step — not a fabricated date.
function addBusinessDays(from: Date, days: number): Date {
  const result = new Date(from);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

function formatEstimateDate(date: Date): string {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export function CheckoutPage() {
  const { selectedItems: items, selectedSubtotal: subtotal, discount, removeItems } = useCart();
  const { user, isAuthenticated, refreshOrders, addAddress, updateAddress, removeAddress } = useAuth();
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
  const [step, setStep] = useState<'address' | 'payment'>('address');

  // Address selection — pick from the account's saved addresses (same data used
  // on the Account page and the Cart page's delivery bar) instead of always
  // typing a fresh address, matching how the Myntra reference page works.
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  // Default to the saved default address (or first) once addresses are loaded;
  // if the account has none yet, go straight to the add-address form.
  useEffect(() => {
    if (!user || selectedAddressId || addressFormOpen) return;
    if (user.addresses.length > 0) {
      const def = user.addresses.find(a => a.isDefault) ?? user.addresses[0];
      setSelectedAddressId(def.id);
    } else {
      setAddressFormOpen(true);
    }
  }, [user, selectedAddressId, addressFormOpen]);

  const shippingCost = shippingMethod === 'express' ? 15 : subtotal > 100 ? 0 : 8;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shippingCost + tax;

  const [estMinDays, estMaxDays] = shippingMethod === 'express' ? [2, 3] : [5, 7];
  const deliveryEstimate = `${formatEstimateDate(addBusinessDays(new Date(), estMinDays))} - ${formatEstimateDate(addBusinessDays(new Date(), estMaxDays))}`;

  const validateShipping = () => {
    const errors: Record<string, string> = {};
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

  const openAddAddress = () => {
    setEditingAddressId(null);
    setShippingData({ ...shippingData, firstName: '', lastName: '', address1: '', address2: '', city: '', country: '', postalCode: '', phone: '' });
    setShippingErrors({});
    setAddressFormOpen(true);
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setShippingData({
      ...shippingData,
      firstName: addr.firstName, lastName: addr.lastName,
      address1: addr.address1, address2: addr.address2 || '', city: addr.city,
      country: addr.country, postalCode: addr.postalCode, phone: addr.phone,
    });
    setShippingErrors({});
    setAddressFormOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!validateShipping()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setSavingAddress(true);
    try {
      const payload = {
        label: 'Home', firstName: shippingData.firstName, lastName: shippingData.lastName,
        address1: shippingData.address1, address2: shippingData.address2 || undefined,
        city: shippingData.city, country: shippingData.country, postalCode: shippingData.postalCode,
        phone: shippingData.phone, isDefault: !user?.addresses.length,
      };
      if (editingAddressId) {
        await updateAddress(editingAddressId, payload);
        setSelectedAddressId(editingAddressId);
      } else {
        await addAddress(payload);
        setSelectedAddressId(null); // picked up by the default-address effect once the new one lands
      }
      showToast('Address saved');
      setAddressFormOpen(false);
      setEditingAddressId(null);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to save address', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleRemoveAddress = async (id: string) => {
    await removeAddress(id);
    if (selectedAddressId === id) setSelectedAddressId(null);
    showToast('Address removed');
  };

  const handleContinueToPayment = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to continue', 'error');
      navigate('/account');
      return;
    }
    const addr = user?.addresses.find(a => a.id === selectedAddressId);
    if (!addr) {
      showToast('Please select a delivery address', 'error');
      return;
    }
    setShippingData({
      ...shippingData,
      firstName: addr.firstName, lastName: addr.lastName,
      address1: addr.address1, address2: addr.address2 || '', city: addr.city,
      country: addr.country, postalCode: addr.postalCode, phone: addr.phone,
    });
    setStep('payment');
    window.scrollTo(0, 0);
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
        {/* Checkout progress — Bag / Address are clickable to go back a step,
            Payment is not (can't skip ahead without completing Address first). */}
        <div className="relative flex items-center justify-center mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em]">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-1 text-[#1A1A1A] hover:underline"
            >
              <Check size={12} strokeWidth={3} /> Bag
            </button>
            <span className="w-8 h-px bg-[#CCC]" />
            <button
              onClick={() => { setStep('address'); window.scrollTo(0, 0); }}
              className={step === 'address' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-1' : 'flex items-center gap-1 text-[#1A1A1A] hover:underline'}
            >
              {step === 'payment' && <Check size={12} strokeWidth={3} />} Address
            </button>
            <span className="w-8 h-px bg-[#CCC]" />
            <span className={step === 'payment' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-1' : 'text-[#999]'}>Payment</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-10">{step === 'address' ? 'Shipping Address' : 'Review & Payment'}</h1>

        {step === 'address' ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Address selection / add / edit */}
            <div className="flex-1 min-w-0 max-w-[720px]">
              {addressFormOpen ? (
                <div>
                  <h2 className="text-lg font-bold mb-6">{editingAddressId ? 'Edit Address' : 'New Address'}</h2>
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

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveAddress}
                      disabled={savingAddress}
                      className="bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-[0.08em] px-8 py-3.5 hover:bg-[#333] transition-colors disabled:opacity-50"
                    >
                      {savingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                    {(user?.addresses.length ?? 0) > 0 && (
                      <button
                        onClick={() => { setAddressFormOpen(false); setEditingAddressId(null); }}
                        className="text-sm font-medium text-[#666] hover:text-[#1A1A1A]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold">Select Delivery Address</h2>
                    <button
                      onClick={openAddAddress}
                      className="flex items-center gap-1.5 border border-[#1A1A1A] text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider px-4 py-2.5 hover:bg-[#1A1A1A] hover:text-white transition-colors"
                    >
                      <Plus size={14} /> Add New Address
                    </button>
                  </div>
                  <div className="space-y-4 mb-8">
                    {user?.addresses.map(addr => (
                      <label
                        key={addr.id}
                        className={`block border p-5 cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-[#1A1A1A]' : 'border-[#E5E5E5] hover:border-[#999]'}`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 accent-[#1A1A1A]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1A1A1A]">{addr.firstName} {addr.lastName}</span>
                              <span className="text-[10px] font-medium uppercase tracking-wider border border-[#E5E5E5] text-[#666] px-2 py-0.5 rounded-full">{addr.label}</span>
                              {addr.isDefault && <span className="text-[10px] font-medium uppercase tracking-wider bg-[#F5F5F5] text-[#666] px-2 py-0.5">Default</span>}
                            </div>
                            <p className="text-sm text-[#666] mt-2">
                              {addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}, {addr.city}, {addr.country} {addr.postalCode}
                            </p>
                            <p className="text-sm text-[#666] mt-1">Mobile: {addr.phone}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <button type="button" onClick={() => openEditAddress(addr)} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#666] hover:text-[#1A1A1A]">
                                <Pencil size={12} /> Edit
                              </button>
                              <button type="button" onClick={() => handleRemoveAddress(addr.id)} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#666] hover:text-[#DC2626]">
                                <Trash2 size={12} /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order summary sidebar — always visible, including while adding/editing an address */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-5">
                <div className="border border-[#E5E5E5] bg-white shadow-sm p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Delivery Estimate</h3>
                  <div className="flex items-center gap-3">
                    <Truck size={18} className="text-[#1A1A1A] shrink-0" />
                    <div>
                      <p className="text-sm text-[#1A1A1A]">
                        Arrives <span className="font-bold">{deliveryEstimate}</span>
                      </p>
                      <p className="text-xs text-[#999] mt-0.5">
                        With {shippingMethod === 'express' ? 'Express' : 'Standard'} Shipping · chosen on the next step
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-[#E5E5E5] bg-white shadow-sm p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
                    Order Summary ({items.length} {items.length === 1 ? 'Item' : 'Items'})
                  </h3>
                  <div className="space-y-3 mb-5 max-h-[280px] overflow-y-auto pr-1">
                    {items.map(item => {
                      const itemPrice = item.product.salePrice || item.product.price;
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover bg-[#F5F5F5] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#1A1A1A] truncate">{item.product.name}</p>
                            <p className="text-xs text-[#999]">Qty {item.quantity}</p>
                          </div>
                          <p className="text-xs font-semibold text-[#1A1A1A] shrink-0">AED {(itemPrice * item.quantity).toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-2 pt-4 border-t border-[#E5E5E5] mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#666]">Subtotal</span>
                      <span className="font-medium">AED {subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-AED {discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm font-bold">Total</span>
                      <span className="font-bold text-lg">AED {(subtotal - discount).toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleContinueToPayment}
                    disabled={!selectedAddressId}
                    className="w-full bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-[0.08em] py-4 hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0 max-w-[720px]">
                {/* Address summary — read-only recap with an Edit link back to step 1 */}
                <div className="flex items-start justify-between gap-4 border border-[#E5E5E5] p-4 mb-8">
                  <div className="text-sm">
                    <p className="font-bold text-[#1A1A1A]">{shippingData.firstName} {shippingData.lastName}</p>
                    <p className="text-[#666] mt-1">
                      {shippingData.address1}{shippingData.address2 ? `, ${shippingData.address2}` : ''}, {shippingData.city}, {shippingData.country} {shippingData.postalCode}
                    </p>
                    <p className="text-[#666] mt-1">Mobile: {shippingData.phone}</p>
                  </div>
                  <button
                    onClick={() => setStep('address')}
                    className="shrink-0 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] underline hover:no-underline"
                  >
                    Edit
                  </button>
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

                {/* Offers — UI placeholder only, not wired to any real promo engine */}
                <div className="border border-[#E5E5E5] p-4 mb-8 flex items-center gap-3">
                  <Percent size={18} className="text-[#DC2626] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Offers</p>
                    <p className="text-xs text-[#999] mt-0.5">Apply a coupon on the Cart or Address step before checking out — offers aren't shown here yet.</p>
                  </div>
                </div>

                {/* Store Credit — UI placeholder; no wallet/credit system exists yet */}
                <label className="flex items-center justify-between p-4 border border-[#E5E5E5] mb-8 opacity-60 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <Wallet size={18} className="text-[#1A1A1A] shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">Store Credit</p>
                      <p className="text-xs text-[#999] mt-0.5">AED 0.00 available</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#999] border border-[#E5E5E5] px-2 py-0.5 rounded-full">Coming Soon</span>
                </label>

                {/* Choose Payment Mode — only Credit/Debit Card is real (via Stripe);
                    the rest are shown as disabled "Coming Soon" tabs so the layout
                    matches the reference without claiming working payment methods. */}
                <h2 className="text-lg font-bold mb-6">Choose Payment Mode</h2>
                <div className="flex flex-col sm:flex-row border border-[#E5E5E5] mb-8">
                  <div className="sm:w-[220px] shrink-0 border-b sm:border-b-0 sm:border-r border-[#E5E5E5]">
                    <div className="flex items-center gap-2 px-4 py-3.5 border-l-4 border-[#DC2626] bg-[#FFF5F5]">
                      <Star size={14} className="text-[#DC2626]" />
                      <span className="text-sm font-semibold text-[#DC2626]">Recommended</span>
                    </div>
                    {[
                      { icon: Banknote, label: 'Cash On Delivery' },
                      { icon: Smartphone, label: 'UPI (Pay via any App)' },
                      { icon: Wallet, label: 'Wallets' },
                      { icon: Clock, label: 'Pay Later' },
                      { icon: Calendar, label: 'EMI' },
                      { icon: Landmark, label: 'Net Banking' },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center justify-between gap-2 px-4 py-3.5 border-t border-[#E5E5E5] opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-[#666] shrink-0" />
                          <span className="text-sm text-[#1A1A1A]">{label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-5">
                    <h3 className="text-sm font-bold text-[#1A1A1A] mb-4">Recommended Payment Options</h3>
                    <label className="flex items-start gap-3 p-4 border border-[#1A1A1A] bg-[#F5F5F5] cursor-default">
                      <input type="radio" checked readOnly className="mt-1 accent-[#1A1A1A]" />
                      <div className="flex items-center gap-3 flex-1">
                        <CreditCard size={20} className="text-[#1A1A1A] shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">Credit / Debit Card</p>
                          <p className="text-xs text-[#999] mt-0.5">Visa, Mastercard or American Express — processed securely by Stripe</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Gift Card — UI placeholder; no gift card system exists yet */}
                <div className="flex items-center justify-between border border-[#E5E5E5] p-4 mb-8 opacity-60">
                  <div className="flex items-center gap-3">
                    <Gift size={18} className="text-[#1A1A1A] shrink-0" />
                    <span className="text-sm font-medium text-[#1A1A1A]">Have a Gift Card?</span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#999] border border-[#E5E5E5] px-2 py-0.5 rounded-full">Coming Soon</span>
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

                <Link to="/faqs" className="block text-center text-sm text-[#666] hover:text-[#1A1A1A] mt-5">
                  Need Help? Contact Us
                </Link>
            </div>

            {/* Price details sidebar */}
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="border border-[#E5E5E5] bg-white shadow-sm p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
                  Price Details ({items.length} {items.length === 1 ? 'Item' : 'Items'})
                </h3>
                <div className="space-y-2 pb-4 border-b border-[#E5E5E5] mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Total MRP</span>
                    <span className="font-medium">AED {items.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount on MRP</span>
                      <span>-AED {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Shipping</span>
                    <span className="font-medium">{shippingCost === 0 ? 'FREE' : `AED ${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Tax</span>
                    <span className="font-medium">AED {tax.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold">Total Amount</span>
                  <span className="font-bold text-lg">AED {total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-[#999] leading-relaxed">
                  By placing the order, you agree to UniStyle's{' '}
                  <Link to="/terms-and-conditions" className="text-[#1A1A1A] underline hover:no-underline">Terms of Use</Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-[#1A1A1A] underline hover:no-underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
          )}

        {/* Payment-method badges — shown on every checkout step, like Myntra's
            persistent footer. Limited to the 4 real methods UniStyle actually
            accepts via Stripe; no RuPay/BHIM/COD/etc. since those aren't supported. */}
        <div className="grid grid-cols-4 gap-5 mt-10 max-w-[700px]">
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
  );
}
