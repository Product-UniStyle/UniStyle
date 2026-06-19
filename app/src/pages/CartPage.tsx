import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="mt-[72px] min-h-[60vh]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 text-center">SHOPPING CART</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={48} className="mx-auto text-[#E5E5E5] mb-6" />
            <h2 className="text-lg font-semibold uppercase tracking-wider mb-4">YOUR CART IS CURRENTLY EMPTY</h2>
            <p className="text-sm text-[#666] mb-8 max-w-[500px] mx-auto">
              Before proceed to checkout you must add some products to your shopping cart. You will find a lot of interesting products on our Website.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-8 py-4 hover:bg-[#333] transition-colors"
            >
              Go To Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Cart Items */}
            <div className="flex-1">
              <div className="border-b border-[#E5E5E5] pb-3 mb-6 hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_40px] text-xs font-medium uppercase tracking-wider text-[#999]">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Total</span>
                <span></span>
              </div>
              <div className="space-y-6">
                {items.map(item => {
                  const itemPrice = item.product.salePrice || item.product.price;
                  return (
                    <div key={item.id} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_40px] items-start md:items-center gap-4 py-4 border-b border-[#E5E5E5]">
                      <div className="flex items-center gap-4">
                        <Link to={`/product/${item.product.slug}`} className="w-20 h-24 bg-[#F5F5F5] shrink-0">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        </Link>
                        <div>
                          <Link to={`/product/${item.product.slug}`} className="text-sm font-medium text-[#1A1A1A] hover:underline">{item.product.name}</Link>
                          {item.color && <p className="text-xs text-[#999] mt-0.5">Color: {item.color}</p>}
                          {item.size && <p className="text-xs text-[#999] mt-0.5">Size: {item.size}</p>}
                          <p className="text-xs text-[#999] mt-0.5 md:hidden">${itemPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="hidden md:block text-sm">${itemPrice.toFixed(2)}</div>
                      <div className="flex items-center border border-[#E5E5E5]">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-[#F5F5F5]"><Minus size={12} /></button>
                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-[#F5F5F5]"><Plus size={12} /></button>
                      </div>
                      <div className="text-sm font-medium">${(itemPrice * item.quantity).toFixed(2)}</div>
                      <button onClick={() => removeFromCart(item.id)} className="text-[#999] hover:text-[#DC2626] transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-[#F5F5F5] p-6">
                <h3 className="text-lg font-bold mb-6">CART TOTALS</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">Shipping</span>
                    <span className="text-[#999]">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-sm pt-3 border-t border-[#E5E5E5]">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-[0.08em] py-4 hover:bg-[#333] transition-colors mb-4"
                >
                  Proceed to Checkout
                </button>
                <Link to="/shop" className="block text-center text-sm text-[#666] hover:text-[#1A1A1A] hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
