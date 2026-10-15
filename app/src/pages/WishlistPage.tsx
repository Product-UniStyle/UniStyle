import { useMemo, useState, useRef, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ChevronDown, Filter, X } from 'lucide-react';
import type { Product } from '@/data/products';
import { useWishlist, type WishlistEntry } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/ToastContainer';

const sortOptions = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Alphabetically, A-Z', value: 'az' },
  { label: 'Alphabetically, Z-A', value: 'za' },
  { label: 'Price, low to high', value: 'price-asc' },
  { label: 'Price, high to low', value: 'price-desc' },
];

function WishlistCard({ product, color }: { product: Product; color: string | null }) {
  const { removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const colorVariant = color ? product.colors?.find(c => c.name === color) : undefined;
  const image = (colorVariant?.images?.[0]) || product.images[0];
  const linkTo = `/product/${product.slug}${color ? `?color=${encodeURIComponent(color)}` : ''}`;

  return (
    <div className="group">
      <div className="relative bg-[#F5F5F5] overflow-hidden">
        <Link to={linkTo}>
          <img
            src={image}
            alt={product.name}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <button
          onClick={() => removeFromWishlist(product.id, color)}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 flex items-center justify-center text-[#1A1A1A] hover:text-[#DC2626] transition-colors"
          aria-label="Remove from wishlist"
        >
          <Heart size={16} fill="currentColor" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
          <button
            onClick={() => { addToCart(product, color ?? undefined); showToast('Added to bag'); }}
            className="w-full bg-[#1A1A1A] text-white text-[11px] font-semibold uppercase tracking-wider py-2.5 hover:bg-[#333] transition-colors"
          >
            Add to Bag
          </button>
        </div>
      </div>
      <div className="mt-3">
        {product.institution && <p className="text-xs text-[#999]">{product.institution}</p>}
        <Link to={linkTo} className="text-sm font-medium text-[#1A1A1A] hover:underline">{product.name}</Link>
        {color && <p className="text-xs text-[#666] mt-0.5">Color: {color}</p>}
        <div className="flex items-center gap-2 mt-1">
          {product.salePrice ? (
            <>
              <span className="text-sm font-semibold text-[#DC2626]">AED {product.salePrice.toFixed(2)}</span>
              <span className="text-sm text-[#999] line-through">AED {product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-semibold">AED {product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { items, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999]);
  const [sort, setSort] = useState('recent');
  const [sortOpen, setSortOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const institutions = useMemo(
    () => Array.from(new Set(items.map(e => e.product.institution).filter((u): u is string => !!u))).sort(),
    [items]
  );

  const categories = useMemo(
    () => Array.from(new Set(items.map(e => e.product.category).filter(Boolean))).sort(),
    [items]
  );

  const maxPrice = useMemo(
    () => Math.ceil(Math.max(...items.map(e => e.product.salePrice || e.product.price), 200)),
    [items]
  );

  const minPrice = useMemo(
    () => (items.length > 0 ? Math.floor(Math.min(...items.map(e => e.product.salePrice || e.product.price))) : 0),
    [items]
  );

  // Snap the price slider's bounds to the real wishlist min/max the first
  // time items load (the [0, 9999] initial value is just a placeholder).
  // Only runs once, so it never stomps a range the user has since dragged.
  const priceInitializedRef = useRef(false);
  useEffect(() => {
    if (!priceInitializedRef.current && items.length > 0) {
      priceInitializedRef.current = true;
      setPriceRange([minPrice, maxPrice]);
    }
  }, [items, minPrice, maxPrice]);

  const applyFilters = (
    source: WishlistEntry[],
    opts: { genders?: string[]; unis?: string[]; cats?: string[]; avail?: string[]; price?: [number, number] }
  ) => {
    let r = source;
    if (opts.genders?.length) r = r.filter(e => e.product.gender?.some(g => opts.genders!.includes(g)));
    if (opts.unis?.length) r = r.filter(e => !!e.product.institution && opts.unis!.includes(e.product.institution));
    if (opts.cats?.length) r = r.filter(e => opts.cats!.includes(e.product.category));
    if (opts.avail?.length) r = r.filter(e => opts.avail!.includes(e.product.inStock ? 'in' : 'out'));
    if (opts.price) r = r.filter(e => { const ep = e.product.salePrice || e.product.price; return ep >= opts.price![0] && ep <= opts.price![1]; });
    return r;
  };

  const genderBase   = useMemo(() => applyFilters(items, { unis: selectedInstitutions, cats: selectedCategories, avail: selectedAvailability, price: priceRange }), [items, selectedInstitutions, selectedCategories, selectedAvailability, priceRange]);
  const institutionBase = useMemo(() => applyFilters(items, { genders: selectedGenders, cats: selectedCategories, avail: selectedAvailability, price: priceRange }), [items, selectedGenders, selectedCategories, selectedAvailability, priceRange]);
  const categoryBase = useMemo(() => applyFilters(items, { genders: selectedGenders, unis: selectedInstitutions, avail: selectedAvailability, price: priceRange }), [items, selectedGenders, selectedInstitutions, selectedAvailability, priceRange]);
  const availBase    = useMemo(() => applyFilters(items, { genders: selectedGenders, unis: selectedInstitutions, cats: selectedCategories, price: priceRange }), [items, selectedGenders, selectedInstitutions, selectedCategories, priceRange]);

  const clearFilters = () => {
    setSelectedGenders([]);
    setSelectedInstitutions([]);
    setSelectedCategories([]);
    setSelectedAvailability([]);
    setPriceRange([minPrice, maxPrice]);
  };

  const toggleGender = (gender: string) => {
    setSelectedGenders(prev => prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]);
  };
  const toggleInstitution = (uni: string) => {
    setSelectedInstitutions(prev => prev.includes(uni) ? prev.filter(u => u !== uni) : [...prev, uni]);
  };
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (selectedGenders.length) result = result.filter(e => e.product.gender?.some(g => selectedGenders.includes(g)));
    if (selectedInstitutions.length) result = result.filter(e => !!e.product.institution && selectedInstitutions.includes(e.product.institution));
    if (selectedCategories.length) result = result.filter(e => selectedCategories.includes(e.product.category));
    if (selectedAvailability.length) {
      result = result.filter(e => selectedAvailability.includes(e.product.inStock ? 'in' : 'out'));
    }
    result = result.filter(e => {
      const effectivePrice = e.product.salePrice || e.product.price;
      return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
    });
    switch (sort) {
      case 'az': result.sort((a, b) => a.product.name.localeCompare(b.product.name)); break;
      case 'za': result.sort((a, b) => b.product.name.localeCompare(a.product.name)); break;
      case 'price-asc': result.sort((a, b) => (a.product.salePrice || a.product.price) - (b.product.salePrice || b.product.price)); break;
      case 'price-desc': result.sort((a, b) => (b.product.salePrice || b.product.price) - (a.product.salePrice || a.product.price)); break;
      default: break;
    }
    return result;
  }, [items, selectedGenders, selectedInstitutions, selectedCategories, selectedAvailability, priceRange, sort]);

  const handleMoveAllToCart = () => {
    items.forEach(e => addToCart(e.product, e.color ?? undefined));
    clearWishlist();
    showToast('Moved all items to cart');
  };

  const handleClearWishlist = () => {
    clearWishlist();
    showToast('Wishlist cleared');
  };

  if (!isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  return (
    <div className="mt-[72px]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="font-playfair text-3xl md:text-4xl font-normal uppercase">Wishlist ({items.length})</h1>
            <p className="text-sm text-[#666] mt-2">
              <Link to="/" className="hover:text-[#1A1A1A]">Home</Link> / Wishlist
            </p>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleMoveAllToCart}
                className="flex items-center gap-2 border border-[#1A1A1A] text-sm font-medium px-4 py-2.5 hover:bg-[#1A1A1A] hover:text-white transition-colors"
              >
                <ShoppingBag size={16} />
                Move All To Cart
              </button>
              <button
                onClick={handleClearWishlist}
                className="flex items-center gap-2 border border-[#E5E5E5] text-sm font-medium px-4 py-2.5 hover:border-[#DC2626] hover:text-[#DC2626] transition-colors"
              >
                <Trash2 size={16} />
                Clear Wishlist
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={48} className="mx-auto text-[#E5E5E5] mb-6" />
            <p className="text-lg text-[#666]">There are no products in wishlist</p>
            <Link to="/shop" className="inline-block mt-6 text-sm font-medium underline hover:text-[#1A1A1A]">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex gap-8 mt-8">
            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white lg:w-[280px] lg:shrink-0 p-6 lg:p-0 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} border-r lg:border-0 border-[#E5E5E5]`}>
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
              </div>
              <div className="flex items-center mb-6">
                <button onClick={clearFilters} className="text-xs font-medium text-[#666] hover:text-[#1A1A1A] underline transition-colors">
                  Reset
                </button>
              </div>

              <>
                  {/* Gender */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Gender</h4>
                    <div className="space-y-2">
                      {(['men', 'women'] as const).map(gender => {
                        const count = genderBase.filter(e => e.product.gender?.includes(gender)).length;
                        return (
                          <label key={gender} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                            <input type="checkbox" checked={selectedGenders.includes(gender)} onChange={() => toggleGender(gender)} className="accent-[#1A1A1A]" />
                            {gender === 'men' ? 'Him' : 'Her'} ({count})
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Institutions */}
                  {institutions.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Institutions</h4>
                      <div className="space-y-2">
                        {institutions.map(uni => {
                          const count = institutionBase.filter(e => e.product.institution === uni).length;
                          return (
                            <label key={uni} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                              <input type="checkbox" checked={selectedInstitutions.includes(uni)} onChange={() => toggleInstitution(uni)} className="accent-[#1A1A1A]" />
                              {uni} ({count})
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Categories</h4>
                    <div className="space-y-2">
                      {categories.map(cat => {
                        const count = categoryBase.filter(e => e.product.category === cat).length;
                        return (
                          <label key={cat} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                            <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="accent-[#1A1A1A]" />
                            {cat} ({count})
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Availability</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-[#666] cursor-pointer">
                        <input type="checkbox" checked={selectedAvailability.includes('in')} onChange={() => setSelectedAvailability(prev => prev.includes('in') ? prev.filter(x => x !== 'in') : [...prev, 'in'])} className="accent-[#1A1A1A]" />
                        In stock ({availBase.filter(e => e.product.inStock).length})
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#666] cursor-pointer">
                        <input type="checkbox" checked={selectedAvailability.includes('out')} onChange={() => setSelectedAvailability(prev => prev.includes('out') ? prev.filter(x => x !== 'out') : [...prev, 'out'])} className="accent-[#1A1A1A]" />
                        Out of stock ({availBase.filter(e => !e.product.inStock).length})
                      </label>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Price</h4>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs text-[#666]">AED {priceRange[0]}</span>
                      <span className="text-xs text-[#666]">-</span>
                      <span className="text-xs text-[#666]">AED {priceRange[1]}</span>
                    </div>
                    <div className="relative h-4">
                      <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full bg-[#E5E5E5]" />
                      <div
                        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#1A1A1A]"
                        style={{
                          left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice || 1)) * 100}%`,
                          right: `${100 - ((Math.min(priceRange[1], maxPrice) - minPrice) / (maxPrice - minPrice || 1)) * 100}%`,
                        }}
                      />
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={e => setPriceRange([Math.min(parseInt(e.target.value), priceRange[1] - 1), priceRange[1]])}
                        className="dual-range-input"
                        aria-label="Minimum price"
                      />
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={Math.min(priceRange[1], maxPrice)}
                        onChange={e => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0] + 1)])}
                        className="dual-range-input"
                        aria-label="Maximum price"
                      />
                    </div>
                  </div>
                </>
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <p className="text-sm text-[#666]">
                  Showing {filteredItems.length} of {items.length} products
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className="text-sm text-[#666] mr-2">Sort by:</span>
                    <button onClick={() => setSortOpen(!sortOpen)} className="inline-flex items-center gap-2 text-sm border border-[#E5E5E5] px-3 py-2 hover:border-[#1A1A1A] transition-colors">
                      {sortOptions.find(o => o.value === sort)?.label || 'Sort'}
                      <ChevronDown size={14} />
                    </button>
                    {sortOpen && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E5E5] py-1 min-w-[200px] z-10">
                        {sortOptions.map(o => (
                          <button
                            key={o.value}
                            onClick={() => { setSort(o.value); setSortOpen(false); }}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#F5F5F5] ${sort === o.value ? 'font-medium' : 'text-[#666]'}`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 border border-[#E5E5E5]"><Filter size={18} /></button>
                </div>
              </div>

              {/* Product Grid */}
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredItems.map(e => <WishlistCard key={`${e.product.id}-${e.color ?? ''}`} product={e.product} color={e.color} />)}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-lg text-[#666] mb-4">No wishlist items match your filters.</p>
                  <button onClick={clearFilters} className="text-sm underline font-medium">Clear all filters</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
