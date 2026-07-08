import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { X, Filter, Grid3X3, LayoutGrid, LayoutList, ChevronDown, ChevronRight } from 'lucide-react';
import type { Product, ProductColor } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { showToast } from '@/components/ToastContainer';
import gsap from 'gsap';

const sortOptions = [
  { label: 'Most relevant', value: 'relevant' },
  { label: 'Best selling', value: 'bestselling' },
  { label: 'Alphabetically, A-Z', value: 'az' },
  { label: 'Alphabetically, Z-A', value: 'za' },
  { label: 'Price, low to high', value: 'price-asc' },
  { label: 'Price, high to low', value: 'price-desc' },
];

const ACCESSORY_CATEGORIES = ['Badges', 'Bagpack', 'Beanies', 'Bottles', 'Crests', 'Mugs', 'Scarfs', 'Tote Bags'];

const CLOTHING_ORDER = ['Hoodies', 'Sweatshirts', 'Tshirts', 'Joggers', 'Caps'];
const CATEGORY_LABELS: Record<string, string> = { Tshirts: 'T-Shirts' };

function ProductCard({ product, color }: { product: Product; color?: ProductColor }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const hasCountdown = !!product.countdownEnd;
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [imgIndex, setImgIndex] = useState(0);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const images = (color?.images && color.images.length > 0) ? color.images : product.images;
  const linkTo = `/product/${product.slug}${color ? `?color=${encodeURIComponent(color.name)}` : ''}`;

  useEffect(() => {
    if (!hasCountdown) return;
    const end = new Date(product.countdownEnd!).getTime();
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [hasCountdown, product.countdownEnd]);

  return (
    <div className="group">
      <div className="relative bg-[#F5F5F5] overflow-hidden">
        <Link
          to={linkTo}
          className="block relative aspect-square overflow-hidden"
          onMouseEnter={() => {
            if (images.length < 2) return;
            cycleRef.current = setInterval(() => {
              setImgIndex(prev => (prev + 1) % images.length);
            }, 1200);
          }}
          onMouseLeave={() => {
            if (cycleRef.current) clearInterval(cycleRef.current);
            setImgIndex(0);
          }}
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === imgIndex ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {images.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === imgIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </Link>
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-[11px] font-medium px-2 py-1">{product.badge}</span>
        )}
        {hasCountdown && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] text-white flex items-center justify-center gap-2 py-2 text-[11px] font-medium">
            <span className="text-white/60">Ends in:</span>
            <span className="border border-white/30 px-1.5 py-0.5">{String(countdown.days).padStart(2, '0')}d</span>
            <span>:</span>
            <span className="border border-white/30 px-1.5 py-0.5">{String(countdown.hours).padStart(2, '0')}h</span>
            <span>:</span>
            <span className="border border-white/30 px-1.5 py-0.5">{String(countdown.mins).padStart(2, '0')}m</span>
            <span>:</span>
            <span className="border border-white/30 px-1.5 py-0.5">{String(countdown.secs).padStart(2, '0')}s</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
          <button
            onClick={() => { addToCart(product, color?.name); showToast('Added to cart'); }}
            className="flex-1 bg-[#1A1A1A] text-white text-[11px] font-semibold uppercase tracking-wider py-2.5 hover:bg-[#333] transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={() => {
              if (inWishlist) { removeFromWishlist(product.id); showToast('Removed from wishlist'); }
              else { addToWishlist(product); showToast('Added to wishlist'); }
            }}
            className={`w-10 flex items-center justify-center border ${inWishlist ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]'} transition-colors`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>
      <div className="mt-3">
        <Link to={linkTo} className="text-sm font-medium text-[#1A1A1A] hover:underline">{product.name}</Link>
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
        <div className="flex items-center gap-1 mt-1">
          {product.rating ? (
            <>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < Math.round(product.rating!) ? '#1A1A1A' : '#E5E5E5'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <span className="text-xs text-[#999]">({product.reviewCount})</span>
            </>
          ) : (
            <span className="text-xs text-[#999]">No reviews yet</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { products, loading } = useProducts();

  // The URL is the single source of truth for every filter — not a separate
  // useState mirror — so the browser back/forward buttons, the navbar's active-link
  // highlighting, and sidebar checkbox toggles all always agree on the current
  // filter state instead of drifting apart.
  const getParamList = (key: string) => {
    const raw = searchParams.get(key);
    return raw ? raw.split(',').filter(Boolean) : [];
  };

  const setParamList = (key: string, values: string[]) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (values.length > 0) next.set(key, values.join(','));
      else next.delete(key);
      return next;
    }, { replace: true });
  };

  const selectedCategories = useMemo(() => {
    const raw = getParamList('category');
    if (raw.includes('Accessories')) {
      return Array.from(new Set([...raw.filter(c => c !== 'Accessories'), ...ACCESSORY_CATEGORIES]));
    }
    return raw;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const selectedGenders = useMemo(() => getParamList('gender'), [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectedUniversities = useMemo(() => getParamList('university'), [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectedColors = useMemo(() => getParamList('color'), [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectedSizes = useMemo(() => getParamList('size'), [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectedAvailability = useMemo(() => getParamList('availability'), [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999]);
  const [sort, setSort] = useState('relevant');
  const [gridCols, setGridCols] = useState(4);
  const [sortOpen, setSortOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);

  // Auto-expand the accessories subpanel when one of its subcategories is active
  // in the URL (e.g. arriving via a header link), without fighting a manual toggle.
  useEffect(() => {
    if (selectedCategories.some(c => ACCESSORY_CATEGORIES.includes(c))) setAccessoriesOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const universities = useMemo(
    () => Array.from(new Set(products.map(p => p.university).filter((u): u is string => !!u))).sort(),
    [products]
  );

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort(),
    [products]
  );

  const accessorySubcategories = useMemo(
    () => categories.filter(c => ACCESSORY_CATEGORIES.includes(c)),
    [categories]
  );

  const otherCategories = useMemo(
    () => categories.filter(c => !ACCESSORY_CATEGORIES.includes(c)),
    [categories]
  );

  const sortedClothingCategories = useMemo(() => {
    const ordered = CLOTHING_ORDER.filter(c => otherCategories.includes(c));
    const rest = otherCategories.filter(c => !CLOTHING_ORDER.includes(c));
    return [...ordered, ...rest];
  }, [otherCategories]);

  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const allSizes = useMemo(() => {
    const found = new Set<string>();
    products.forEach(p => p.sizes?.forEach(s => found.add(s)));
    return Array.from(found).sort((a, b) => {
      const ai = sizeOrder.indexOf(a);
      const bi = sizeOrder.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [products]);

  const maxPrice = useMemo(
    () => Math.ceil(Math.max(...products.map(p => p.salePrice || p.price), 200)),
    [products]
  );

  // Derived from real product data — not a hardcoded palette — so any color name
  // entered in the admin panel or a bulk-upload sheet shows up as a filter option.
  const colorOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach(p => p.colors?.forEach(c => { if (!map.has(c.name)) map.set(c.name, c.hex); }));
    return Array.from(map, ([name, hex]) => ({ name, hex }));
  }, [products]);

  // Helper: apply all filters except one group, used for independent facet counts
  const applyFilters = (
    source: Product[],
    opts: { genders?: string[]; cats?: string[]; unis?: string[]; colors?: string[]; sizes?: string[]; avail?: string[]; price?: [number, number] }
  ) => {
    let r = source;
    if (opts.genders?.length) r = r.filter(p => p.gender?.some(g => opts.genders!.includes(g)));
    if (opts.cats?.length) r = r.filter(p => opts.cats!.includes(p.category));
    if (opts.unis?.length) r = r.filter(p => !!p.university && opts.unis!.includes(p.university));
    if (opts.colors?.length) r = r.filter(p => p.colors?.some(c => opts.colors!.includes(c.name)));
    if (opts.sizes?.length) r = r.filter(p => p.sizes?.some(s => opts.sizes!.includes(s)));
    if (opts.avail?.length) r = r.filter(p => opts.avail!.includes(p.inStock ? 'in' : 'out'));
    if (opts.price) r = r.filter(p => { const ep = p.salePrice || p.price; return ep >= opts.price![0] && ep <= opts.price![1]; });
    return r;
  };

  // Base pools for each filter group (all active filters EXCEPT that group)
  const genderBase = useMemo(() => applyFilters(products, { cats: selectedCategories, unis: selectedUniversities, colors: selectedColors, sizes: selectedSizes, avail: selectedAvailability, price: priceRange }), [products, selectedCategories, selectedUniversities, selectedColors, selectedSizes, selectedAvailability, priceRange]);
  const categoryBase = useMemo(() => applyFilters(products, { genders: selectedGenders, unis: selectedUniversities, colors: selectedColors, sizes: selectedSizes, avail: selectedAvailability, price: priceRange }), [products, selectedGenders, selectedUniversities, selectedColors, selectedSizes, selectedAvailability, priceRange]);
  const universityBase = useMemo(() => applyFilters(products, { genders: selectedGenders, cats: selectedCategories, colors: selectedColors, sizes: selectedSizes, avail: selectedAvailability, price: priceRange }), [products, selectedGenders, selectedCategories, selectedColors, selectedSizes, selectedAvailability, priceRange]);
  const sizeBase = useMemo(() => applyFilters(products, { genders: selectedGenders, cats: selectedCategories, unis: selectedUniversities, colors: selectedColors, avail: selectedAvailability, price: priceRange }), [products, selectedGenders, selectedCategories, selectedUniversities, selectedColors, selectedAvailability, priceRange]);
  const availBase = useMemo(() => applyFilters(products, { genders: selectedGenders, cats: selectedCategories, unis: selectedUniversities, colors: selectedColors, sizes: selectedSizes, price: priceRange }), [products, selectedGenders, selectedCategories, selectedUniversities, selectedColors, selectedSizes, priceRange]);
  const colorBase = useMemo(() => applyFilters(products, { genders: selectedGenders, cats: selectedCategories, unis: selectedUniversities, sizes: selectedSizes, avail: selectedAvailability, price: priceRange }), [products, selectedGenders, selectedCategories, selectedUniversities, selectedSizes, selectedAvailability, priceRange]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedGenders.length) result = result.filter(p => p.gender?.some(g => selectedGenders.includes(g)));
    if (selectedCategories.length) result = result.filter(p => selectedCategories.includes(p.category));
    if (selectedUniversities.length) result = result.filter(p => !!p.university && selectedUniversities.includes(p.university));
    if (selectedColors.length) result = result.filter(p => p.colors?.some(c => selectedColors.includes(c.name)));
    if (selectedSizes.length) result = result.filter(p => p.sizes?.some(s => selectedSizes.includes(s)));
    if (selectedAvailability.length) {
      result = result.filter(p => selectedAvailability.includes(p.inStock ? 'in' : 'out'));
    }
    result = result.filter(p => {
      const effectivePrice = p.salePrice || p.price;
      return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
    });
    switch (sort) {
      case 'az': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'za': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price-asc': result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)); break;
      case 'price-desc': result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)); break;
      default: break;
    }
    return result;
  }, [products, selectedGenders, selectedCategories, selectedUniversities, selectedColors, selectedSizes, selectedAvailability, priceRange, sort]);

  // One grid tile per color variant (so a 3-color product shows 3 tiles). When a
  // color filter is active, only the matching color variant(s) are shown per
  // product rather than all of that product's colors.
  const gridEntries = useMemo(() => {
    const entries: { key: string; product: Product; color?: ProductColor }[] = [];
    filteredProducts.forEach(p => {
      if (p.colors && p.colors.length > 0) {
        const toShow = selectedColors.length > 0
          ? p.colors.filter(c => selectedColors.includes(c.name))
          : p.colors;
        toShow.forEach(c => entries.push({ key: `${p.id}-${c.name}`, product: p, color: c }));
      } else {
        entries.push({ key: p.id, product: p });
      }
    });
    return entries;
  }, [filteredProducts, selectedColors]);

  const clearFilters = () => {
    setPriceRange([0, 9999]);
    setSearchParams({}, { replace: true });
  };

  const toggleGender = (gender: string) => {
    setParamList('gender', selectedGenders.includes(gender) ? selectedGenders.filter(g => g !== gender) : [...selectedGenders, gender]);
  };

  const toggleCategory = (cat: string) => {
    setParamList('category', selectedCategories.includes(cat) ? selectedCategories.filter(c => c !== cat) : [...selectedCategories, cat]);
  };

  const toggleUniversity = (uni: string) => {
    setParamList('university', selectedUniversities.includes(uni) ? selectedUniversities.filter(u => u !== uni) : [...selectedUniversities, uni]);
  };

  const toggleSize = (size: string) => {
    setParamList('size', selectedSizes.includes(size) ? selectedSizes.filter(s => s !== size) : [...selectedSizes, size]);
  };

  const toggleColor = (name: string) => {
    setParamList('color', selectedColors.includes(name) ? selectedColors.filter(c => c !== name) : [...selectedColors, name]);
  };

  const toggleAvailability = (key: string) => {
    setParamList('availability', selectedAvailability.includes(key) ? selectedAvailability.filter(a => a !== key) : [...selectedAvailability, key]);
  };

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.shop-card', { y: 30, opacity: 0, duration: 0.5, stagger: 0.08, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, [filteredProducts]);

  return (
    <div className="mt-[72px]">
      {/* Banner */}
      {/* <div className="relative bg-[#1A1A1A] h-[300px] md:h-[400px] flex flex-col items-center justify-center text-white">
        <div className="absolute inset-0 opacity-30">
          <img src="/hero-1.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">PRODUCTS</h1>
          <p className="text-sm text-white/70 mt-3">Home / Products</p>
        </div>
      </div> */}

      <div ref={sectionRef} className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex gap-8">
          {/* Mobile backdrop */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}
          {/* Sidebar */}
          <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white lg:w-[280px] lg:shrink-0 p-6 lg:p-0 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} border-r lg:border-0 border-[#E5E5E5]`}>
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            <div className="flex items-center  mb-6">
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
                      const count = genderBase.filter(p => p.gender?.includes(gender)).length;
                      return (
                        <label key={gender} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                          <input type="checkbox" checked={selectedGenders.includes(gender)} onChange={() => toggleGender(gender)} className="accent-[#1A1A1A]" />
                          {gender === 'men' ? 'Men' : 'Women'} ({count})
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Universities */}
                {universities.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Universities</h4>
                    <div className="space-y-2">
                      {universities.map(uni => {
                        const count = universityBase.filter(p => p.university === uni).length;
                        return (
                          <label key={uni} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                            <input type="checkbox" checked={selectedUniversities.includes(uni)} onChange={() => toggleUniversity(uni)} className="accent-[#1A1A1A]" />
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
                    {sortedClothingCategories.map(cat => {
                      const count = categoryBase.filter(p => p.category === cat).length;
                      const label = CATEGORY_LABELS[cat] || cat;
                      return (
                        <label key={cat} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                          <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="accent-[#1A1A1A]" />
                          {label} ({count})
                        </label>
                      );
                    })}
                    {accessorySubcategories.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between w-full text-sm text-[#666]">
                          <label className="flex items-center gap-2 cursor-pointer hover:text-[#1A1A1A]">
                            <input
                              type="checkbox"
                              ref={el => {
                                if (el) {
                                  const selectedCount = accessorySubcategories.filter(c => selectedCategories.includes(c)).length;
                                  el.indeterminate = selectedCount > 0 && selectedCount < accessorySubcategories.length;
                                }
                              }}
                              checked={accessorySubcategories.every(c => selectedCategories.includes(c))}
                              onChange={() => {
                                const allSelected = accessorySubcategories.every(c => selectedCategories.includes(c));
                                setParamList('category', allSelected
                                  ? selectedCategories.filter(c => !accessorySubcategories.includes(c))
                                  : Array.from(new Set([...selectedCategories, ...accessorySubcategories])));
                              }}
                              className="accent-[#1A1A1A]"
                            />
                            Accessories ({categoryBase.filter(p => ACCESSORY_CATEGORIES.includes(p.category)).length})
                          </label>
                          <button
                            type="button"
                            onClick={() => setAccessoriesOpen(prev => !prev)}
                            aria-label="Toggle accessories subcategories"
                          >
                            <ChevronRight size={14} className={`transition-transform ${accessoriesOpen ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                        {accessoriesOpen && (
                          <div className="mt-2 ml-4 space-y-2">
                            {accessorySubcategories.map(cat => {
                              const count = categoryBase.filter(p => p.category === cat).length;
                              return (
                                <label key={cat} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                                  <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="accent-[#1A1A1A]" />
                                  {cat} ({count})
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Size */}
                {allSizes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Size</h4>
                    <div className="space-y-2">
                      {allSizes.map(size => {
                        const count = sizeBase.filter(p => p.sizes?.includes(size)).length;
                        return (
                          <label key={size} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                            <input type="checkbox" checked={selectedSizes.includes(size)} onChange={() => toggleSize(size)} className="accent-[#1A1A1A]" />
                            {size} ({count})
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Availability */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Availability</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-[#666] cursor-pointer">
                      <input type="checkbox" checked={selectedAvailability.includes('in')} onChange={() => toggleAvailability('in')} className="accent-[#1A1A1A]" />
                      In stock ({availBase.filter(p => p.inStock).length})
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#666] cursor-pointer">
                      <input type="checkbox" checked={selectedAvailability.includes('out')} onChange={() => toggleAvailability('out')} className="accent-[#1A1A1A]" />
                      Out of stock ({availBase.filter(p => !p.inStock).length})
                    </label>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Price</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-[#666]">${priceRange[0]}</span>
                    <span className="text-xs text-[#666]">-</span>
                    <span className="text-xs text-[#666]">${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={Math.min(priceRange[1], maxPrice)}
                    onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-[#1A1A1A]"
                  />
                </div>

                {/* Colors */}
                {colorOptions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(c => {
                      const count = colorBase.filter(p => p.colors?.some(pc => pc.name === c.name)).length;
                      return (
                        <button
                          key={c.name}
                          onClick={() => toggleColor(c.name)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColors.includes(c.name) ? 'border-[#1A1A1A] scale-110' : 'border-[#E5E5E5]'}`}
                          style={{ backgroundColor: c.hex }}
                          title={`${c.name} (${count})`}
                        />
                      );
                    })}
                  </div>
                </div>
                )}
            </>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <p className="text-sm text-[#666]">
                Showing {gridEntries.length} of {products.length} products
              </p>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-1">
                  <button onClick={() => setGridCols(2)} className={`p-2 ${gridCols === 2 ? 'text-[#1A1A1A]' : 'text-[#999]'}`}><LayoutGrid size={18} /></button>
                  <button onClick={() => setGridCols(3)} className={`p-2 ${gridCols === 3 ? 'text-[#1A1A1A]' : 'text-[#999]'}`}><Grid3X3 size={18} /></button>
                  <button onClick={() => setGridCols(4)} className={`p-2 ${gridCols === 4 ? 'text-[#1A1A1A]' : 'text-[#999]'}`}><LayoutList size={18} /></button>
                </div>
                <div className="relative">
                  <button onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-2 text-sm border border-[#E5E5E5] px-3 py-2 hover:border-[#1A1A1A] transition-colors">
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
            {loading ? (
              <div className="text-center py-20">
                <p className="text-lg text-[#666]">Loading products...</p>
              </div>
            ) : gridEntries.length > 0 ? (
              <div className={`grid gap-6 ${gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                {gridEntries.map(({ key, product, color }) => (
                  <div key={key} className="shop-card">
                    <ProductCard product={product} color={color} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg text-[#666] mb-4">No products match your filters.</p>
                <button onClick={clearFilters} className="text-sm underline font-medium">Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
