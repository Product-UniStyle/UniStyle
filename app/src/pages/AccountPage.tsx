import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Package, Heart, MapPin, Settings, LogOut, Plus, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { showToast } from '@/components/ToastContainer';

export function AccountPage() {
  const { user, isAuthenticated, login, register, logout, updateProfile, addAddress, removeAddress, orders } = useAuth();
  const { totalItems: wishlistTotal } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
  });
  const [profileEdit, setProfileEdit] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    firstName: '', lastName: '', address1: '', address2: '', city: '', country: '', postalCode: '', phone: '',
  });

  useEffect(() => {
    if (searchParams.get('order') === 'success') {
      const orderId = searchParams.get('orderId');
      showToast(orderId ? `Order #${orderId} placed successfully!` : 'Order placed successfully!');
      setActiveTab('orders');
      searchParams.delete('order');
      searchParams.delete('orderId');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) {
      showToast('Signed in successfully');
    } else {
      showToast('Invalid credentials', 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    });
    if (success) {
      showToast('Account created successfully');
    } else {
      showToast('Email already registered', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profileEdit);
    showToast('Profile updated');
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAddress({ ...addressForm, isDefault: false });
    setShowAddressForm(false);
    setAddressForm({ firstName: '', lastName: '', address1: '', address2: '', city: '', country: '', postalCode: '', phone: '' });
    showToast('Address added');
  };

  if (!isAuthenticated) {
    return (
      <div className="mt-[72px] min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-[480px] px-6">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="text-center">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Sign In</h1>
              <p className="text-sm text-[#666] mb-8">Sign in to your account</p>
              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-4 outline-none focus:border-[#1A1A1A] transition-colors"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-6 outline-none focus:border-[#1A1A1A] transition-colors"
              />
              <button type="submit" className="w-full bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-[0.08em] py-4 hover:bg-[#333] transition-colors">
                Sign In
              </button>
              <p className="text-sm text-[#666] mt-4">
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('register')} className="underline font-medium hover:text-[#1A1A1A]">
                  Create one
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="text-center">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
              <p className="text-sm text-[#666] mb-8">Join our fashion community</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A] transition-colors"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full border border-[#E5E5E5] px-4 py-3 text-sm outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-4 outline-none focus:border-[#1A1A1A] transition-colors"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-[#E5E5E5] px-4 py-3 text-sm mb-6 outline-none focus:border-[#1A1A1A] transition-colors"
              />
              <button type="submit" className="w-full bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-[0.08em] py-4 hover:bg-[#333] transition-colors">
                Create Account
              </button>
              <p className="text-sm text-[#666] mt-4">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="underline font-medium hover:text-[#1A1A1A]">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'account', label: 'My Account', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'My Wishlist', icon: Heart },
    { id: 'addresses', label: 'Address Book', icon: MapPin },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="mt-[72px] min-h-[60vh]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-lg">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-[#999]">{user?.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id ? 'text-[#1A1A1A] border-l-[3px] border-[#1A1A1A] bg-[#F5F5F5]' : 'text-[#666] hover:text-[#1A1A1A]'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => {
                  logout();
                  showToast('Signed out');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#666] hover:text-[#DC2626] transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'account' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Welcome back, {user?.firstName}!</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-[#F5F5F5] p-6 text-center">
                    <Package size={24} className="mx-auto mb-3" />
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-xs text-[#666] uppercase tracking-wider mt-1">Orders</p>
                  </div>
                  <Link to="/wishlist" className="bg-[#F5F5F5] p-6 text-center hover:bg-[#E5E5E5] transition-colors">
                    <Heart size={24} className="mx-auto mb-3" />
                    <p className="text-2xl font-bold">{wishlistTotal}</p>
                    <p className="text-xs text-[#666] uppercase tracking-wider mt-1">Wishlist Items</p>
                  </Link>
                  <div className="bg-[#F5F5F5] p-6 text-center">
                    <MapPin size={24} className="mx-auto mb-3" />
                    <p className="text-2xl font-bold">{user?.addresses.length || 0}</p>
                    <p className="text-xs text-[#666] uppercase tracking-wider mt-1">Saved Addresses</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Orders</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-[#F5F5F5]">
                    <Package size={36} className="mx-auto text-[#CCC] mb-4" />
                    <p className="text-[#666]">No orders yet</p>
                    <Link to="/shop" className="text-sm underline mt-2 inline-block">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border border-[#E5E5E5] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-semibold">Order #{order.id}</p>
                            <p className="text-xs text-[#999]">{order.date}</p>
                          </div>
                          <span className={`text-xs font-medium uppercase px-3 py-1 ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover bg-[#F5F5F5]" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-[#999]">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-4 pt-4 border-t border-[#E5E5E5]">
                          <span className="text-sm text-[#666]">Total</span>
                          <span className="font-bold">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
                <Link to="/wishlist" className="text-sm underline text-[#666] hover:text-[#1A1A1A]">
                  View full wishlist
                </Link>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Address Book</h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-2 text-sm font-medium mb-6 px-4 py-3 border border-dashed border-[#CCC] hover:border-[#1A1A1A] transition-colors"
                  >
                    <Plus size={16} /> Add New Address
                  </button>
                )}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="bg-[#F5F5F5] p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">New Address</h3>
                      <button type="button" onClick={() => setShowAddressForm(false)}><X size={16} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input required placeholder="First Name" value={addressForm.firstName} onChange={e => setAddressForm({ ...addressForm, firstName: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                      <input required placeholder="Last Name" value={addressForm.lastName} onChange={e => setAddressForm({ ...addressForm, lastName: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                    </div>
                    <input required placeholder="Address" value={addressForm.address1} onChange={e => setAddressForm({ ...addressForm, address1: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A] mb-4" />
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <input required placeholder="City" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                      <input required placeholder="Country" value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                      <input required placeholder="Postal Code" value={addressForm.postalCode} onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                    </div>
                    <input required placeholder="Phone" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A] mb-4" />
                    <button type="submit" className="bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-6 py-3 hover:bg-[#333] transition-colors">Save Address</button>
                  </form>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user?.addresses.map(addr => (
                    <div key={addr.id} className="border border-[#E5E5E5] p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                        <div className="flex items-center gap-2">
                          {addr.isDefault && <span className="text-[10px] font-medium uppercase tracking-wider bg-[#F5F5F5] px-2 py-1">Default</span>}
                          <button onClick={async () => { await removeAddress(addr.id); showToast('Address removed'); }} className="text-[#999] hover:text-[#DC2626]"><X size={14} /></button>
                        </div>
                      </div>
                      <p className="text-sm text-[#666]">{addr.address1}</p>
                      <p className="text-sm text-[#666]">{addr.city}, {addr.country} {addr.postalCode}</p>
                      <p className="text-sm text-[#666] mt-1">{addr.phone}</p>
                    </div>
                  ))}
                  {user?.addresses.length === 0 && (
                    <p className="text-sm text-[#999]">No addresses saved.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                <form onSubmit={handleSaveProfile} className="max-w-[500px]">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">First Name</label>
                      <input value={profileEdit.firstName} onChange={e => setProfileEdit({ ...profileEdit, firstName: e.target.value })} className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Last Name</label>
                      <input value={profileEdit.lastName} onChange={e => setProfileEdit({ ...profileEdit, lastName: e.target.value })} className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Email</label>
                    <input type="email" value={profileEdit.email} onChange={e => setProfileEdit({ ...profileEdit, email: e.target.value })} className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                  </div>
                  <button type="submit" className="bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-6 py-3 hover:bg-[#333] transition-colors">
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
