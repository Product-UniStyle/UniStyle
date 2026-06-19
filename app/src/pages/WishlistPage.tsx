import { Link } from 'react-router-dom';
import { X, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { showToast } from '@/components/ToastContainer';

export function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="mt-[72px]">
      {/* Banner */}
      <div className="relative bg-[#1A1A1A] h-[250px] md:h-[300px] flex flex-col items-center justify-center text-white">
        <div className="absolute inset-0 opacity-20">
          <img src="/hero-2.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">WISHLIST</h1>
          <p className="text-sm text-white/70 mt-3">Home / Wishlist</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 min-h-[50vh]">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={48} className="mx-auto text-[#E5E5E5] mb-6" />
            <p className="text-lg text-[#666]">There are no products in wishlist</p>
            <Link to="/shop" className="inline-block mt-6 text-sm font-medium underline hover:text-[#1A1A1A]">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(product => (
              <div key={product.id} className="group">
                <div className="relative bg-[#F5F5F5] overflow-hidden">
                  <Link to={`/product/${product.slug}`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    onClick={() => {
                      removeFromWishlist(product.id);
                      showToast('Removed from wishlist');
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 flex items-center justify-center text-[#666] hover:text-[#DC2626] transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="mt-3">
                  <Link to={`/product/${product.slug}`} className="text-sm font-medium text-[#1A1A1A] hover:underline">
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    {product.salePrice ? (
                      <>
                        <span className="text-sm font-semibold">${product.salePrice.toFixed(2)}</span>
                        <span className="text-sm text-[#999] line-through">${product.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      addToCart(product);
                      showToast('Added to cart');
                    }}
                    className="mt-3 w-full bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] py-2.5 hover:bg-[#333] transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
