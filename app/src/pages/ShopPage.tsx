import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { X, Filter, Grid3X3, LayoutGrid, LayoutList, ChevronDown, ChevronRight, Search } from 'lucide-react';
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

const CLOTHING_ORDER = ['Hoodie', 'Sweatshirt', 'T-Shirt', 'Bottoms', 'Caps'];
const CATEGORY_LABELS: Record<string, string> = { 'T-Shirt': 'T-Shirts', Hoodie: 'Hoodies', Sweatshirt: 'Sweatshirts' };

// Builds a Google-style page list: first page, last page, a window around the
// current page, and '...' where those ranges don't connect.
function getPageList(current: number, total: number): (number | '...')[] {
  const delta = 2;
  const windowStart = Math.max(2, current - delta);
  const windowEnd = Math.min(total - 1, current + delta);

  const list: (number | '...')[] = [1];
  if (windowStart > 2) list.push('...');
  for (let i = windowStart; i <= windowEnd; i++) list.push(i);
  if (windowEnd < total - 1) list.push('...');
  if (total > 1) list.push(total);
  return list;
}

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
        {!!product.rating && (
          <span className="absolute top-3 right-3 flex items-center gap-0.5 bg-[#1B2A6B] text-white text-[11px] font-medium px-1.5 py-1">
            {product.rating.toFixed(1)}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </span>
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
      </div>
    </div>
  );
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  // Keyed on this history entry so a fresh visit (new nav) never accidentally
  // reuses another visit's saved position, but the browser Back button — which
  // returns to this exact entry — reliably finds it again.
  const scrollStateKey = `shop-scroll:${location.key}`;
  const sectionRef = useRef<HTMLDivElement>(null);
  const { products, loading } = useProducts();

  // Which categories currently contain at least one accessory-flagged product —
  // computed from live product data instead of a hardcoded category list, so
  // adding a new accessory type never requires a code change.
  const accessoryCategories = useMemo(
    () => Array.from(new Set(products.filter(p => p.isAccessory).map(p => p.category).filter(Boolean))),
    [products]
  );

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
      return Array.from(new Set([...raw.filter(c => c !== 'Accessories'), ...accessoryCategories]));
    }
    return raw;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, accessoryCategories]);
  const selectedGenders = useMemo(() => getParamList('gender'), [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectedInstitutions = useMemo(() => getParamList('institution'), [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectedType = searchParams.get('type') as 'university' | 'school' | null;
  const selectedColors = useMemo(() => getParamList('color'), [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectedSizes = useMemo(() => getParamList('size'), [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectedAvailability = useMemo(() => getParamList('availability'), [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999]);
  const [sort, setSort] = useState('relevant');
  const [gridCols, setGridCols] = useState(4);
  const [sortOpen, setSortOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const PAGE_SIZE = 100;
  const [page, setPage] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(scrollStateKey);
      const parsedPage = saved ? Number(JSON.parse(saved).page) : NaN;
      return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    } catch {
      return 1;
    }
  });
  const pageRef = useRef(page);
  useEffect(() => { pageRef.current = page; }, [page]);
  const isFirstFilterEffectRunRef = useRef(true);
  const scrollRestoredRef = useRef(false);

  // Tracks the live scroll position continuously (not just at unmount time) — some
  // cleanup that runs during route transition (e.g. the GSAP scroll-trigger teardown
  // below) resets window.scrollY to 0 before our own unmount cleanup gets a chance to
  // read it, so reading window.scrollY fresh at unmount is unreliable. This ref always
  // holds the last real position while the user was actually still on this page.
  const lastScrollYRef = useRef(0);
  useEffect(() => {
    const onScroll = () => { lastScrollYRef.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Freeze the scroll position on the click itself (capture phase — runs before
    // React Router's own Link click handling), not just on 'scroll' events: something
    // during route-transition teardown resets window.scrollY to 0 and dispatches a
    // real 'scroll' event for it too, which would otherwise stomp the ref right along
    // with window.scrollY. Capturing at click time is strictly earlier than that reset.
    const onClickCapture = () => { lastScrollYRef.current = window.scrollY; };
    document.addEventListener('click', onClickCapture, true);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  // Auto-expand the accessories subpanel when one of its subcategories is active
  // in the URL (e.g. arriving via a header link), without fighting a manual toggle.
  useEffect(() => {
    if (selectedCategories.some(c => accessoryCategories.includes(c))) setAccessoriesOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, accessoryCategories]);

  const universities = useMemo(
    () => Array.from(new Set(products.filter(p => (p.institutionType ?? 'university') === 'university').map(p => p.institution).filter((u): u is string => !!u))).sort(),
    [products]
  );

  const schools = useMemo(
    () => Array.from(new Set(products.filter(p => p.institutionType === 'school').map(p => p.institution).filter((u): u is string => !!u))).sort(),
    [products]
  );

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort(),
    [products]
  );

  const accessorySubcategories = useMemo(
    () => categories.filter(c => accessoryCategories.includes(c)),
    [categories, accessoryCategories]
  );

  const otherCategories = useMemo(
    () => categories.filter(c => !accessoryCategories.includes(c)),
    [categories, accessoryCategories]
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

  // Snap the price slider's upper bound down to the real catalog max the first
  // time product data loads (the 9999 initial value is just a placeholder so
  // nothing gets filtered out while products are still loading). Only runs
  // once, so it never stomps a range the user has since dragged themselves.
  const priceInitializedRef = useRef(false);
  useEffect(() => {
    if (!priceInitializedRef.current && products.length > 0) {
      priceInitializedRef.current = true;
      setPriceRange([0, maxPrice]);
    }
  }, [products, maxPrice]);

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
    opts: { genders?: string[]; cats?: string[]; unis?: string[]; type?: 'university' | 'school' | null; colors?: string[]; sizes?: string[]; avail?: string[]; price?: [number, number] }
  ) => {
    let r = source;
    if (opts.genders?.length) r = r.filter(p => p.gender?.some(g => opts.genders!.includes(g)));
    if (opts.cats?.length) r = r.filter(p => opts.cats!.includes(p.category));
    if (opts.unis?.length) r = r.filter(p => !!p.institution && opts.unis!.includes(p.institution));
    if (opts.type) r = r.filter(p => (p.institutionType ?? 'university') === opts.type);
    if (opts.colors?.length) r = r.filter(p => p.colors?.some(c => opts.colors!.includes(c.name)));
    if (opts.sizes?.length) r = r.filter(p => p.sizes?.some(s => opts.sizes!.includes(s)));
    if (opts.avail?.length) r = r.filter(p => opts.avail!.includes(p.inStock ? 'in' : 'out'));
    if (opts.price) r = r.filter(p => { const ep = p.salePrice || p.price; return ep >= opts.price![0] && ep <= opts.price![1]; });
    return r;
  };

  // Base pools for each filter group (all active filters EXCEPT that group)
  const genderBase = useMemo(() => applyFilters(products, { cats: selectedCategories, unis: selectedInstitutions, type: selectedType, colors: selectedColors, sizes: selectedSizes, avail: selectedAvailability, price: priceRange }), [products, selectedCategories, selectedInstitutions, selectedType, selectedColors, selectedSizes, selectedAvailability, priceRange]);
  const categoryBase = useMemo(() => applyFilters(products, { genders: selectedGenders, unis: selectedInstitutions, type: selectedType, colors: selectedColors, sizes: selectedSizes, avail: selectedAvailability, price: priceRange }), [products, selectedGenders, selectedInstitutions, selectedType, selectedColors, selectedSizes, selectedAvailability, priceRange]);
  const institutionBase = useMemo(() => applyFilters(products, { genders: selectedGenders, cats: selectedCategories, type: selectedType, colors: selectedColors, sizes: selectedSizes, avail: selectedAvailability, price: priceRange }), [products, selectedGenders, selectedCategories, selectedType, selectedColors, selectedSizes, selectedAvailability, priceRange]);
  const sizeBase = useMemo(() => applyFilters(products, { genders: selectedGenders, cats: selectedCategories, unis: selectedInstitutions, type: selectedType, colors: selectedColors, avail: selectedAvailability, price: priceRange }), [products, selectedGenders, selectedCategories, selectedInstitutions, selectedType, selectedColors, selectedAvailability, priceRange]);
  const availBase = useMemo(() => applyFilters(products, { genders: selectedGenders, cats: selectedCategories, unis: selectedInstitutions, type: selectedType, colors: selectedColors, sizes: selectedSizes, price: priceRange }), [products, selectedGenders, selectedCategories, selectedInstitutions, selectedType, selectedColors, selectedSizes, priceRange]);
  const colorBase = useMemo(() => applyFilters(products, { genders: selectedGenders, cats: selectedCategories, unis: selectedInstitutions, type: selectedType, sizes: selectedSizes, avail: selectedAvailability, price: priceRange }), [products, selectedGenders, selectedCategories, selectedInstitutions, selectedType, selectedSizes, selectedAvailability, priceRange]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedGenders.length) result = result.filter(p => p.gender?.some(g => selectedGenders.includes(g)));
    if (selectedCategories.length) result = result.filter(p => selectedCategories.includes(p.category));
    if (selectedInstitutions.length) result = result.filter(p => !!p.institution && selectedInstitutions.includes(p.institution));
    if (selectedType) result = result.filter(p => (p.institutionType ?? 'university') === selectedType);
    if (selectedColors.length) result = result.filter(p => p.colors?.some(c => selectedColors.includes(c.name)));
    if (selectedSizes.length) result = result.filter(p => p.sizes?.some(s => selectedSizes.includes(s)));
    if (selectedAvailability.length) {
      result = result.filter(p => selectedAvailability.includes(p.inStock ? 'in' : 'out'));
    }
    result = result.filter(p => {
      const effectivePrice = p.salePrice || p.price;
      return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
    });
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case 'az': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'za': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price-asc': result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)); break;
      case 'price-desc': result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)); break;
      default: break;
    }
    return result;
  }, [products, selectedGenders, selectedCategories, selectedInstitutions, selectedType, selectedColors, selectedSizes, selectedAvailability, priceRange, searchQuery, sort]);

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

  const totalPages = Math.max(1, Math.ceil(gridEntries.length / PAGE_SIZE));
  const pagedEntries = gridEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Jump back to page 1 whenever filters/sort change the result set, and clamp
  // down if the current page no longer exists (e.g. a filter shrinks the list).
  // Skipped on the very first run so a restored page (from Back navigation) isn't
  // immediately stomped back to 1 before the user even touches a filter.
  // Keyed off serialized filter *values*, not the raw arrays: selectedCategories
  // (via accessoryCategories) gets a brand-new array reference once useProducts'
  // async fetch resolves, even when its contents haven't actually changed — a plain
  // reference-based dep list would treat that as a real filter change and reset
  // the page, silently overriding a page restored from Back navigation.
  const filterSignature = JSON.stringify([selectedGenders, selectedCategories, selectedInstitutions, selectedType, selectedColors, selectedSizes, selectedAvailability, priceRange, searchQuery, sort]);
  useEffect(() => {
    if (isFirstFilterEffectRunRef.current) {
      isFirstFilterEffectRunRef.current = false;
      return;
    }
    setPage(1);
  }, [filterSignature]);

  useEffect(() => {
    // Skip while products are still loading — gridEntries/totalPages are both
    // artificially 1 at that point, which would otherwise clamp a restored page back down.
    if (loading) return;
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore scroll position after returning via Back — must wait for products to
  // finish loading so the page is tall enough to actually scroll to that position.
  useEffect(() => {
    if (loading || scrollRestoredRef.current) return;
    scrollRestoredRef.current = true;
    try {
      const saved = sessionStorage.getItem(scrollStateKey);
      if (saved) {
        const { scrollY } = JSON.parse(saved);
        if (typeof scrollY === 'number') window.scrollTo(0, scrollY);
      }
    } catch {
      // ignore malformed/unavailable sessionStorage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Save scroll position + page just before leaving this page (e.g. clicking into
  // a product), so the Back button can restore exactly where the user was.
  useEffect(() => {
    return () => {
      try {
        sessionStorage.setItem(scrollStateKey, JSON.stringify({ page: pageRef.current, scrollY: lastScrollYRef.current }));
      } catch {
        // ignore unavailable sessionStorage (e.g. private browsing quota)
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearFilters = () => {
    setPriceRange([0, maxPrice]);
    setSearchQuery('');
    setSearchParams({}, { replace: true });
  };

  const toggleGender = (gender: string) => {
    setParamList('gender', selectedGenders.includes(gender) ? selectedGenders.filter(g => g !== gender) : [...selectedGenders, gender]);
  };

  const toggleCategory = (cat: string) => {
    setParamList('category', selectedCategories.includes(cat) ? selectedCategories.filter(c => c !== cat) : [...selectedCategories, cat]);
  };

  const toggleInstitution = (uni: string) => {
    const nextInstitutions = selectedInstitutions.includes(uni) ? selectedInstitutions.filter(u => u !== uni) : [...selectedInstitutions, uni];
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      // A specific institution already disambiguates university vs. school, so
      // drop 'type' to avoid it silently zeroing out results (e.g. type=school
      // still set from a header click, then checking a university in the sidebar).
      next.delete('type');
      if (nextInstitutions.length > 0) next.set('institution', nextInstitutions.join(',')); else next.delete('institution');
      return next;
    }, { replace: true });
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
  }, [pagedEntries]);

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
                          {selectedType === 'school'
                            ? gender === 'men' ? 'Boys' : 'Girls'
                            : gender === 'men' ? 'Men' : 'Women'} ({count})
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
                        const count = institutionBase.filter(p => p.institution === uni).length;
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

                {/* Schools */}
                {schools.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Schools</h4>
                    <div className="space-y-2">
                      {schools.map(school => {
                        const count = institutionBase.filter(p => p.institution === school).length;
                        return (
                          <label key={school} className="flex items-center gap-2 text-sm text-[#666] cursor-pointer hover:text-[#1A1A1A]">
                            <input type="checkbox" checked={selectedInstitutions.includes(school)} onChange={() => toggleInstitution(school)} className="accent-[#1A1A1A]" />
                            {school} ({count})
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
                            Accessories ({categoryBase.filter(p => accessoryCategories.includes(p.category)).length})
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
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs text-[#666]">AED {priceRange[0]}</span>
                    <span className="text-xs text-[#666]">-</span>
                    <span className="text-xs text-[#666]">AED {priceRange[1]}</span>
                  </div>
                  <div className="relative h-4">
                    <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full bg-[#E5E5E5]" />
                    <div
                      className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#1A1A1A]"
                      style={{
                        left: `${(priceRange[0] / maxPrice) * 100}%`,
                        right: `${100 - (Math.min(priceRange[1], maxPrice) / maxPrice) * 100}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={e => setPriceRange([Math.min(parseInt(e.target.value), priceRange[1] - 1), priceRange[1]])}
                      className="dual-range-input"
                      aria-label="Minimum price"
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      value={Math.min(priceRange[1], maxPrice)}
                      onChange={e => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0] + 1)])}
                      className="dual-range-input"
                      aria-label="Maximum price"
                    />
                  </div>
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
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-md px-3 py-2 w-[260px] shrink-0">
                  <Search size={16} className="text-[#999] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 min-w-0 bg-transparent outline-none text-sm text-[#1A1A1A] placeholder:text-[#999]"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="text-[#999] hover:text-[#1A1A1A] shrink-0">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#666] whitespace-nowrap">
                  Showing {pagedEntries.length} of {gridEntries.length} products
                </p>
              </div>
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
              <>
                <div className={`grid gap-6 ${gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                  {pagedEntries.map(({ key, product, color }) => (
                    <div key={key} className="shop-card">
                      <ProductCard product={product} color={color} />
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-[#E5E5E5]">
                    <button
                      onClick={() => { setPage((p) => p - 1); window.scrollTo(0, 0); }}
                      disabled={page <= 1}
                      className="text-sm border border-[#E5E5E5] px-4 py-2 hover:border-[#1A1A1A] transition-colors disabled:opacity-40 disabled:hover:border-[#E5E5E5] disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {getPageList(page, totalPages).map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-[#999]">
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                          aria-current={p === page ? 'page' : undefined}
                          className={`w-9 h-9 flex items-center justify-center text-sm border transition-colors ${
                            p === page
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                              : 'border-[#E5E5E5] hover:border-[#1A1A1A]'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => { setPage((p) => p + 1); window.scrollTo(0, 0); }}
                      disabled={page >= totalPages}
                      className="text-sm border border-[#E5E5E5] px-4 py-2 hover:border-[#1A1A1A] transition-colors disabled:opacity-40 disabled:hover:border-[#E5E5E5] disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
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
