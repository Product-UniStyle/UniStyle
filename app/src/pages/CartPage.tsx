import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Heart, Lock, ShieldCheck, Tag, MapPin, ChevronLeft, ChevronDown, Check, Pencil, Trash2, Plus } from 'lucide-react';
import { useCart, type CartItem } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth, type Address } from '@/context/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { showToast } from '@/components/ToastContainer';
import { COUNTRIES } from '@/data/countries';

function MoveFromBagModal({ item, onClose, onRemove, onMoveToWishlist }: {
  item: CartItem;
  onClose: () => void;
  onRemove: () => void;
  onMoveToWishlist: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[420px] bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 p-5">
          <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 object-cover bg-[#F5F5F5] shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-1.5">Move from Bag</h3>
            <p className="text-sm text-[#666] leading-relaxed">Are you sure you want to move this item from bag?</p>
          </div>
          <button onClick={onClose} className="text-[#1A1A1A] hover:text-[#666] transition-colors shrink-0" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 border-t border-[#E5E5E5]">
          <button
            onClick={onRemove}
            className="py-3.5 text-sm font-semibold text-[#666] uppercase tracking-wider hover:bg-[#F5F5F5] transition-colors border-r border-[#E5E5E5]"
          >
            Remove
          </button>
          <button
            onClick={onMoveToWishlist}
            className="py-3.5 text-sm font-semibold text-[#E4007C] uppercase tracking-wider hover:bg-[#F5F5F5] transition-colors"
          >
            Move to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}

function SizeModal({ item, onClose, onSelect }: {
  item: CartItem;
  onClose: () => void;
  onSelect: (size: string) => void;
}) {
  const sizes = item.product.sizes || [];
  const itemPrice = item.product.salePrice || item.product.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[420px] bg-white shadow-xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 object-cover bg-[#F5F5F5] shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#1A1A1A] leading-snug">{item.product.name}</h3>
            <p className="text-sm font-semibold mt-1">AED {itemPrice.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="text-[#1A1A1A] hover:text-[#666] transition-colors shrink-0" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#666] mb-3">Select Size</h4>
        <div className="grid grid-cols-4 gap-3">
          {sizes.map(size => (
            <button
              key={size}
              onClick={() => onSelect(size)}
              className={`h-11 flex items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                item.size === size ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#E5E5E5] text-[#1A1A1A] hover:border-[#1A1A1A]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function QtyModal({ item, onClose, onSelect }: {
  item: CartItem;
  onClose: () => void;
  onSelect: (qty: number) => void;
}) {
  const options = Array.from({ length: 10 }, (_, i) => i + 1);
  const itemPrice = item.product.salePrice || item.product.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[420px] bg-white shadow-xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 object-cover bg-[#F5F5F5] shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#1A1A1A] leading-snug">{item.product.name}</h3>
            <p className="text-sm font-semibold mt-1">AED {itemPrice.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="text-[#1A1A1A] hover:text-[#666] transition-colors shrink-0" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#666] mb-3">Select Quantity</h4>
        <div className="grid grid-cols-5 gap-3">
          {options.map(qty => (
            <button
              key={qty}
              onClick={() => onSelect(qty)}
              className={`h-11 flex items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                item.quantity === qty ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#E5E5E5] text-[#1A1A1A] hover:border-[#1A1A1A]'
              }`}
            >
              {qty}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const emptyAddressForm = { firstName: '', lastName: '', address1: '', address2: '', city: '', country: '', postalCode: '', phone: '' };

function ChangeAddressModal({ onClose }: { onClose: () => void }) {
  const { user, addAddress, updateAddress, removeAddress } = useAuth();
  const [formOpen, setFormOpen] = useState(user ? user.addresses.length === 0 : false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAddressForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.address1.trim()) e.address1 = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.country.trim()) e.country = 'Required';
    if (!form.postalCode.trim()) e.postalCode = 'Required';
    else if (!/^\d{3,10}$/.test(form.postalCode.trim())) e.postalCode = 'Numbers only';
    if (!form.phone.trim()) e.phone = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyAddressForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      firstName: addr.firstName, lastName: addr.lastName, address1: addr.address1,
      address2: addr.address2 || '', city: addr.city, country: addr.country,
      postalCode: addr.postalCode, phone: addr.phone,
    });
    setErrors({});
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        label: 'Home', firstName: form.firstName, lastName: form.lastName,
        address1: form.address1, address2: form.address2 || undefined,
        city: form.city, country: form.country, postalCode: form.postalCode,
        phone: form.phone, isDefault: !user?.addresses.length,
      };
      if (editingId) await updateAddress(editingId, payload);
      else await addAddress(payload);
      showToast('Address saved');
      setFormOpen(false);
      setEditingId(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeliverHere = async (id: string) => {
    await updateAddress(id, { isDefault: true });
    showToast('Delivery address updated');
    onClose();
  };

  const handleRemove = async (id: string) => {
    await removeAddress(id);
    showToast('Address removed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[560px] max-h-[85vh] overflow-y-auto bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5E5] sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-[#1A1A1A]">
            {formOpen ? (editingId ? 'Edit Address' : 'New Address') : 'Select Delivery Address'}
          </h3>
          <button onClick={onClose} className="text-[#1A1A1A] hover:text-[#666] transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {formOpen ? (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <input placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={`w-full border px-4 py-3 text-sm outline-none ${errors.firstName ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`} />
                {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <input placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className={`w-full border px-4 py-3 text-sm outline-none ${errors.lastName ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`} />
                {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
              </div>
            </div>
            <div className="mb-4">
              <input placeholder="Address" value={form.address1} onChange={e => setForm({ ...form, address1: e.target.value })} className={`w-full border px-4 py-3 text-sm outline-none ${errors.address1 ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`} />
              {errors.address1 && <p className="text-xs text-red-600 mt-1">{errors.address1}</p>}
            </div>
            <input placeholder="Apartment, suite, etc. (optional)" value={form.address2} onChange={e => setForm({ ...form, address2: e.target.value })} className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-4 outline-none focus:border-[#1A1A1A]" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={`w-full border px-4 py-3 text-sm outline-none ${errors.city ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`} />
                {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
              </div>
              <div>
                <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className={`w-full border px-4 py-3 text-sm outline-none bg-white ${errors.country ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`}>
                  <option value="">Country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.country && <p className="text-xs text-red-600 mt-1">{errors.country}</p>}
              </div>
              <div>
                <input placeholder="Postal Code" inputMode="numeric" value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value.replace(/\D/g, '') })} className={`w-full border px-4 py-3 text-sm outline-none ${errors.postalCode ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`} />
                {errors.postalCode && <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>}
              </div>
            </div>
            <div className="mb-6">
              <input placeholder="Phone" inputMode="numeric" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} className={`w-full border px-4 py-3 text-sm outline-none ${errors.phone ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#1A1A1A]'}`} />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} disabled={saving} className="bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-[0.08em] px-6 py-3 hover:bg-[#333] transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Address'}
              </button>
              {(user?.addresses.length ?? 0) > 0 && (
                <button onClick={() => { setFormOpen(false); setEditingId(null); }} className="text-sm font-medium text-[#666] hover:text-[#1A1A1A]">
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#999]">Saved Address</span>
              <button onClick={openAdd} className="flex items-center gap-1 text-sm font-semibold text-[#DC2626] hover:underline">
                <Plus size={14} /> Add New Address
              </button>
            </div>
            <div className="space-y-4">
              {user?.addresses.map(addr => (
                <div key={addr.id} className={`border p-4 ${addr.isDefault ? 'border-[#1A1A1A]' : 'border-[#E5E5E5]'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${addr.isDefault ? 'border-[#DC2626]' : 'border-[#CCC]'}`}>
                      {addr.isDefault && <span className="w-2 h-2 rounded-full bg-[#DC2626]" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#1A1A1A]">{addr.firstName} {addr.lastName}</span>
                        {addr.isDefault && <span className="text-[10px] font-medium uppercase tracking-wider text-[#999]">(Default)</span>}
                        <span className="text-[10px] font-medium uppercase tracking-wider border border-[#E5E5E5] text-[#666] px-2 py-0.5 rounded-full">{addr.label}</span>
                      </div>
                      <p className="text-sm text-[#666] mt-2">
                        {addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}, {addr.city}, {addr.country} {addr.postalCode}
                      </p>
                      <p className="text-sm text-[#666] mt-1">Mobile: {addr.phone}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => handleDeliverHere(addr.id)}
                          disabled={addr.isDefault}
                          className="text-xs font-semibold uppercase tracking-wider border border-[#E5E5E5] px-4 py-2 hover:border-[#1A1A1A] transition-colors disabled:opacity-50 disabled:cursor-default"
                        >
                          {addr.isDefault ? 'Delivering Here' : 'Deliver Here'}
                        </button>
                        <button onClick={() => openEdit(addr)} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#666] hover:text-[#1A1A1A]">
                          <Pencil size={12} /> Edit
                        </button>
                        <button onClick={() => handleRemove(addr.id)} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#666] hover:text-[#DC2626]">
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(user?.addresses.length ?? 0) === 0 && (
                <p className="text-sm text-[#999]">No saved addresses yet.</p>
              )}
            </div>
            <button
              onClick={openAdd}
              className="w-full border border-dashed border-[#E5E5E5] py-3 mt-4 text-sm font-semibold text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors"
            >
              + Add New Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function YouMayAlsoLike() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const suggestions = products.slice(0, 4);

  if (suggestions.length === 0) return null;

  return (
    <div className="border border-[#E5E5E5] p-6">
      <h3 className="font-playfair text-sm font-normal tracking-widest uppercase mb-5">You May Also Like</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {suggestions.map(product => {
          const inWishlist = isInWishlist(product.id);
          return (
            <div key={product.id} className="group">
              <div className="relative bg-[#F5F5F5] overflow-hidden mb-3">
                <Link to={`/product/${product.slug}`}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button
                  onClick={() => {
                    if (inWishlist) {
                      removeFromWishlist(product.id);
                      showToast('Removed from wishlist');
                    } else {
                      addToWishlist(product);
                      showToast('Added to wishlist');
                    }
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-[#F5F5F5] transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    size={14}
                    fill={inWishlist ? 'currentColor' : 'none'}
                    className={inWishlist ? 'text-[#1A1A1A]' : 'text-[#666]'}
                  />
                </button>
              </div>
              <Link to={`/product/${product.slug}`} className="block text-sm font-medium text-[#1A1A1A] hover:underline leading-snug mb-1 truncate">
                {product.name}
              </Link>
              <p className="text-sm font-semibold mb-3">
                AED {(product.salePrice ?? product.price).toFixed(2)}
              </p>
              <button
                onClick={() => { addToCart(product); showToast('Added to cart'); }}
                className="w-full border border-[#1A1A1A] text-[#1A1A1A] text-[11px] font-semibold uppercase tracking-wider py-2.5 hover:bg-[#1A1A1A] hover:text-white transition-colors"
              >
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CartPage() {
  const {
    items, removeFromCart, updateQuantity, updateSize,
    isSelected, toggleSelected, selectAll, deselectAll, selectedItems, selectedSubtotal,
    promoCode, promoApplied, discount, applyPromoCode, removePromoCode,
  } = useCart();
  const { addToWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const deliveryAddress = user?.addresses.find(a => a.isDefault) ?? user?.addresses[0];
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const [sizeModalItem, setSizeModalItem] = useState<CartItem | null>(null);
  const [qtyModalItem, setQtyModalItem] = useState<CartItem | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [couponFormOpen, setCouponFormOpen] = useState(false);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to checkout', 'error');
      navigate('/account');
      return;
    }
    navigate('/checkout');
  };

  const handleApplyPromo = () => {
    if (applyPromoCode(promoInput)) {
      showToast('Promo code applied!');
    } else {
      showToast('Invalid promo code', 'error');
    }
  };

  // Sum of list prices (before any per-product sale) for the selected lines —
  // compared against selectedSubtotal (which already uses salePrice) to show
  // how much of the total saving came from product discounts vs. the coupon.
  const totalMrp = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const mrpDiscount = totalMrp - selectedSubtotal;
  const totalSavings = mrpDiscount + discount;
  const payable = selectedSubtotal - discount;

  if (items.length === 0) {
    return (
      <div className="mt-[72px] min-h-[60vh]">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-12">
          <h1 className="font-playfair text-2xl md:text-3xl font-normal tracking-widest mb-10 text-center">SHOPPING CART</h1>

          {/* Empty message */}
          <div className="text-center py-10 mb-10">
            <div className="w-16 h-16 rounded-full border-2 border-[#E5E5E5] flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={28} strokeWidth={1.5} className="text-[#999]" />
            </div>
            <h2 className="text-base font-bold uppercase tracking-wider mb-3">Your Cart Is Currently Empty</h2>
            <p className="text-sm text-[#666] mb-8 max-w-[420px] mx-auto leading-relaxed">
              Before proceed to checkout you must add some products to your shopping cart.
              You will find a lot of interesting products on our Website.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.1em] px-10 py-4 hover:bg-[#333] transition-colors"
            >
              Go To Shopping
            </Link>
          </div>

          {/* You May Also Like + Order Summary */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <YouMayAlsoLike />
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="border border-[#E5E5E5] p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Subtotal</span>
                    <span className="font-medium">AED 0.00</span>
                  </div>
                  <div className="flex justify-between text-sm pb-4 border-b border-[#E5E5E5]">
                    <span className="text-[#666]">Shipping</span>
                    <span className="font-medium">AED 0.00</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg">AED 0.00</span>
                  </div>
                </div>
                <button
                  disabled
                  className="w-full bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.1em] py-4 mb-3 opacity-50 cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
                <Link
                  to="/shop"
                  className="block text-center w-full border border-[#1A1A1A] text-[#1A1A1A] text-xs font-semibold uppercase tracking-[0.1em] py-4 mb-4 hover:bg-[#F5F5F5] transition-colors"
                >
                  Continue Shopping
                </Link>
                <div className="flex items-center justify-center gap-2 text-xs text-[#999]">
                  <Lock size={12} />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[72px] min-h-[60vh] bg-[#F5F5F5]">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 pt-6">
        {/* Checkout progress */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em]">
            <span className="text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-1">Bag</span>
            <span className="w-8 h-px bg-[#CCC]" />
            <span className="text-[#999]">Address</span>
            <span className="w-8 h-px bg-[#CCC]" />
            <span className="text-[#999]">Payment</span>
          </div>
          <div className="absolute right-0 hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#666]">
            <ShieldCheck size={14} className="text-green-600" />
            100% Secure
          </div>
        </div>
      </div>
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 pb-12">
        {/* Title + item count */}
        <div className="text-center mb-10">
          <h1 className="font-playfair text-2xl md:text-3xl font-normal tracking-widest">SHOPPING CART</h1>
          <p className="text-sm text-[#999] mt-1">{items.length} {items.length === 1 ? 'Item' : 'Items'}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 min-w-0">
            {/* Delivery address — real saved address from the user's account, not a placeholder */}
            <div className="border border-[#E5E5E5] bg-white shadow-sm p-5 mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <MapPin size={18} className="text-[#DC2626] shrink-0 mt-0.5" />
                {isAuthenticated && deliveryAddress ? (
                  <div className="min-w-0">
                    <p className="text-sm text-[#1A1A1A]">
                      Deliver to: <span className="font-bold">{deliveryAddress.firstName} {deliveryAddress.lastName}</span>, {deliveryAddress.postalCode}
                    </p>
                    <p className="text-xs text-[#666] mt-0.5 truncate">
                      {deliveryAddress.address1}{deliveryAddress.address2 ? `, ${deliveryAddress.address2}` : ''}, {deliveryAddress.city}, {deliveryAddress.country}
                    </p>
                  </div>
                ) : isAuthenticated ? (
                  <p className="text-sm text-[#1A1A1A]">No delivery address saved yet.</p>
                ) : (
                  <p className="text-sm text-[#1A1A1A]">Sign in to choose a delivery address.</p>
                )}
              </div>
              <button
                onClick={() => isAuthenticated ? setAddressModalOpen(true) : navigate('/account')}
                className="shrink-0 border border-[#DC2626] text-[#DC2626] text-xs font-semibold uppercase tracking-wider px-4 py-2 hover:bg-[#DC2626] hover:text-white transition-colors"
              >
                {isAuthenticated && deliveryAddress ? 'Change Address' : isAuthenticated ? 'Add Address' : 'Sign In'}
              </button>
            </div>

            <div className="border border-[#E5E5E5] bg-white shadow-sm p-6">
            {/* Selection bar */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E5E5E5]">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length > 0 && selectedItems.length === items.length}
                  ref={el => {
                    if (el) el.indeterminate = selectedItems.length > 0 && selectedItems.length < items.length;
                  }}
                  onChange={() => (selectedItems.length === items.length ? deselectAll() : selectAll())}
                  className="accent-[#1A1A1A]"
                />
                {selectedItems.length}/{items.length} Items Selected
              </label>
              {selectedItems.length > 0 && (
                <div className="flex items-stretch text-xs font-semibold uppercase tracking-wider">
                  <button
                    onClick={() => selectedItems.forEach(item => removeFromCart(item.id))}
                    className="pr-4 text-[#666] hover:text-[#DC2626] transition-colors"
                  >
                    Remove
                  </button>
                  <span className="w-px bg-[#E5E5E5]" />
                  <button
                    onClick={() => selectedItems.forEach(item => { addToWishlist(item.product); removeFromCart(item.id); })}
                    className="pl-4 text-[#666] hover:text-[#1A1A1A] transition-colors text-right leading-tight"
                  >
                    Move to<br />Wishlist
                  </button>
                </div>
              )}
            </div>

            {/* Items — one card per line item, Myntra-style: image left, name/price/
                size+qty/remove stacked right, instead of a column-table layout. */}
            <div className="divide-y divide-[#E5E5E5]">
              {items.map(item => {
                const itemPrice = item.product.salePrice || item.product.price;
                const onSale = !!item.product.salePrice && item.product.salePrice < item.product.price;
                const hasSizes = (item.product.sizes?.length ?? 0) > 0;
                return (
                  <div key={item.id} className="flex items-start gap-4 py-5">
                    {/* Image + select */}
                    <div className="relative w-[92px] h-[112px] shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleSelected(item.id)}
                        aria-label={isSelected(item.id) ? 'Deselect item' : 'Select item'}
                        className={`absolute -top-1.5 -left-1.5 z-10 w-5 h-5 flex items-center justify-center border-2 transition-colors ${
                          isSelected(item.id) ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-white border-[#CCC]'
                        }`}
                      >
                        {isSelected(item.id) && <Check size={12} strokeWidth={3} />}
                      </button>
                      <Link to={`/product/${item.product.slug}`} className="block w-full h-full bg-[#F5F5F5] overflow-hidden">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </Link>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link to={`/product/${item.product.slug}`} className="text-sm font-semibold text-[#1A1A1A] hover:underline leading-snug">
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-[#999] mt-1">
                            {item.product.category}{item.color ? ` · ${item.color}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => setItemToRemove(item)}
                          className="text-[#999] hover:text-[#DC2626] transition-colors shrink-0"
                          aria-label="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Size + Quantity — both dropdown pills, matching Myntra's "Size: S ▾ / Qty: 1 ▾" */}
                      <div className="flex items-center flex-wrap gap-2 mt-3">
                        {hasSizes && (
                          <button
                            type="button"
                            onClick={() => setSizeModalItem(item)}
                            className="flex items-center gap-1 text-xs font-medium text-[#1A1A1A] border border-[#E5E5E5] rounded-full px-3 py-1.5 hover:border-[#1A1A1A] transition-colors"
                          >
                            Size: {item.size || 'Select'} <ChevronDown size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setQtyModalItem(item)}
                          className="flex items-center gap-1 text-xs font-medium text-[#1A1A1A] border border-[#E5E5E5] rounded-full px-3 py-1.5 hover:border-[#1A1A1A] transition-colors"
                        >
                          Qty: {item.quantity} <ChevronDown size={12} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm font-bold text-[#1A1A1A]">AED {itemPrice.toFixed(2)}</span>
                        {onSale && (
                          <>
                            <span className="text-xs text-[#999] line-through">AED {item.product.price.toFixed(2)}</span>
                            <span className="text-xs font-semibold text-[#DC2626]">
                              AED {(item.product.price - itemPrice).toFixed(2)} OFF
                            </span>
                          </>
                        )}
                        {item.quantity > 1 && (
                          <span className="text-xs text-[#999]">× {item.quantity} = AED {(itemPrice * item.quantity).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </div>

            {/* Continue Shopping button */}
            <div className="mt-6">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 border border-[#E5E5E5] text-[#1A1A1A] text-xs font-semibold uppercase tracking-[0.08em] px-6 py-3 hover:border-[#1A1A1A] transition-colors"
              >
                <ChevronLeft size={14} />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Offers & Coupons + Cart Totals */}
          <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0 space-y-5">
            {/* Offers & Coupons — its own card, like Myntra's separate box above price details */}
            <div className="border border-[#E5E5E5] bg-white shadow-sm p-6">
              <h3 className="text-base font-bold uppercase tracking-wider mb-4">Offers &amp; Coupons</h3>
              {!promoApplied && (
                <button
                  type="button"
                  onClick={() => { setPromoInput('SAVE10'); setCouponFormOpen(true); }}
                  className="w-full flex items-center justify-between gap-3 bg-[#F5F5F5] border border-[#E5E5E5] px-3 py-3 mb-4 text-left hover:border-[#1A1A1A] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Tag size={16} className="text-[#DC2626] shrink-0" />
                    <span className="text-sm text-[#1A1A1A] min-w-0">
                      Use code <span className="font-bold">SAVE10</span> for 10% off your order
                    </span>
                  </div>
                  <ChevronDown size={14} className="-rotate-90 text-[#999] shrink-0" />
                </button>
              )}
              {promoApplied ? (
                <div className="flex items-center justify-between bg-[#F5F5F5] px-3 py-2.5 text-sm">
                  <span className="font-medium text-[#1A1A1A]">{promoCode} applied</span>
                  <button onClick={removePromoCode} className="text-xs font-semibold text-[#DC2626] hover:underline">
                    Remove
                  </button>
                </div>
              ) : couponFormOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Enter coupon code"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value)}
                    className="flex-1 min-w-0 border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 hover:bg-[#333] transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A]">
                    <Tag size={16} className="text-[#999]" />
                    Apply Coupons
                  </div>
                  <button
                    onClick={() => setCouponFormOpen(true)}
                    className="border border-[#1A1A1A] text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider px-4 py-2 hover:bg-[#1A1A1A] hover:text-white transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Cart Totals */}
            <div className="border border-[#E5E5E5] bg-white shadow-sm p-6">
              <h3 className={`text-base font-bold uppercase tracking-wider ${selectedItems.length !== items.length ? 'mb-1' : 'mb-5'}`}>
                Price Details ({selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'})
              </h3>
              {selectedItems.length !== items.length && (
                <p className="text-xs text-[#999] mb-5">{selectedItems.length} of {items.length} items selected</p>
              )}

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Total MRP</span>
                  <span className="font-medium">AED {totalMrp.toFixed(2)}</span>
                </div>
                {mrpDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount on MRP</span>
                    <span>-AED {mrpDiscount.toFixed(2)}</span>
                  </div>
                )}
                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount ({promoCode})</span>
                    <span>-AED {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pb-5 border-b border-[#E5E5E5]">
                  <span className="text-[#666]">Shipping</span>
                  <span className="text-[#999] text-xs">Calculated at checkout</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold">Total</span>
                  <span className="font-bold text-xl">AED {payable.toFixed(2)}</span>
                </div>
                {totalSavings > 0 && (
                  <p className="text-xs font-semibold text-green-600 text-center pt-1">
                    You will save AED {totalSavings.toFixed(2)} on this order
                  </p>
                )}
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={selectedItems.length === 0}
                className="w-full bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.1em] py-4 hover:bg-[#333] transition-colors mb-3 disabled:opacity-40 disabled:hover:bg-[#1A1A1A] disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
              <Link
                to="/shop"
                className="block text-center w-full border border-[#E5E5E5] text-[#1A1A1A] text-xs font-semibold uppercase tracking-[0.1em] py-4 hover:border-[#1A1A1A] transition-colors mb-5"
              >
                Continue Shopping
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-[#999]">
                <Lock size={12} />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {itemToRemove && (
        <MoveFromBagModal
          item={itemToRemove}
          onClose={() => setItemToRemove(null)}
          onRemove={() => {
            removeFromCart(itemToRemove.id);
            showToast('Removed from bag');
            setItemToRemove(null);
          }}
          onMoveToWishlist={() => {
            addToWishlist(itemToRemove.product);
            removeFromCart(itemToRemove.id);
            showToast('Moved to wishlist');
            setItemToRemove(null);
          }}
        />
      )}

      {sizeModalItem && (
        <SizeModal
          item={sizeModalItem}
          onClose={() => setSizeModalItem(null)}
          onSelect={(size) => {
            updateSize(sizeModalItem.id, size);
            showToast('Size updated');
            setSizeModalItem(null);
          }}
        />
      )}

      {qtyModalItem && (
        <QtyModal
          item={qtyModalItem}
          onClose={() => setQtyModalItem(null)}
          onSelect={(qty) => {
            updateQuantity(qtyModalItem.id, qty);
            setQtyModalItem(null);
          }}
        />
      )}

      {addressModalOpen && (
        <ChangeAddressModal onClose={() => setAddressModalOpen(false)} />
      )}
    </div>
  );
}
