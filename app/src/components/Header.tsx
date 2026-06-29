import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, X, Menu, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const menItems = [
  { label: 'View All Men', href: '/shop?gender=men' },
  { label: 'Hoodies', href: '/shop?gender=men&category=Hoodies' },
  { label: 'T-Shirts', href: '/shop?gender=men&category=T-Shirt' },
  { label: 'Sweatshirts', href: '/shop?gender=men&category=SweatShirt' },
  { label: 'Bottoms', href: '/shop?gender=men&category=Bottom' },
  { label: 'Caps', href: '/shop?gender=men&category=Caps' },
];

const womenItems = [
  { label: 'View All Women', href: '/shop?gender=women' },
  { label: 'Hoodies', href: '/shop?gender=women&category=Hoodies' },
  { label: 'T-Shirts', href: '/shop?gender=women&category=T-Shirt' },
  { label: 'Sweatshirts', href: '/shop?gender=women&category=SweatShirt' },
  { label: 'Bottoms', href: '/shop?gender=women&category=Bottom' },
  { label: 'Dresses', href: '/shop?gender=women&category=Dresses' },
];

const universityItems = [
  { label: 'View All Universities', href: '/shop' },
  { label: 'De Montfort University', href: '/shop?university=De+Montfort+University' },
  { label: 'Heriot-Watt University', href: '/shop?university=Heriot-Watt+University' },
  { label: 'Middlesex University', href: '/shop?university=Middlesex+University' },
  { label: 'New York University', href: '/shop?university=New+York+University' },
  { label: 'University of Birmingham', href: '/shop?university=University+of+Birmingham' },
  { label: 'University of Wollongong', href: '/shop?university=University+of+Wollongong' },
];

const accessoriesItems = [
  { label: 'View All Accessories', href: '/shop?category=Accessories' },
  { label: 'Badges', href: '/shop?category=Badges' },
  { label: 'Bagpack', href: '/shop?category=Bagpack' },
  { label: 'Beanies', href: '/shop?category=Beanies' },
  { label: 'Bottles', href: '/shop?category=Bottles' },
  { label: 'Crests', href: '/shop?category=Crests' },
  { label: 'Mugs', href: '/shop?category=Mugs' },
  { label: 'Scarfs', href: '/shop?category=Scarfs' },
  { label: 'Tote Bags', href: '/shop?category=Tote+Bags' },
];

type DropdownItem = { label: string; href: string };

type NavItem = {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
};

const navLinks: NavItem[] = [
  // { label: 'Home', href: '/' },
  // { label: 'Shop', href: '/shop' },
  { label: 'Men', href: '/shop?gender=men', dropdown: menItems },
  { label: 'Women', href: '/shop?gender=women', dropdown: womenItems },
  { label: 'Universities', href: '/shop', dropdown: universityItems },
  { label: 'Accessories', href: '/shop?category=Accessories', dropdown: accessoriesItems },
  // { label: 'Product', href: '/shop' },
  // { label: 'Blog', href: '/blog' },
  // { label: 'Featured', href: '/shop' },
];

function MobileMenu({ navLinks, onClose }: { navLinks: NavItem[]; onClose: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => setOpenIndex(prev => prev === index ? null : index);

  return (
    <div className="fixed inset-0 z-[54] bg-white pt-[72px] lg:hidden overflow-y-auto">
      <div className="px-6 py-6">
        {navLinks.map((link, index) => (
          <div key={link.label} className="border-b border-[#E5E5E5]">
            {link.dropdown ? (
              <>
                <button
                  className="flex items-center justify-between w-full text-lg font-medium py-4"
                  onClick={() => toggle(index)}
                >
                  {link.label}
                  <ChevronDown
                    size={18}
                    className={`text-[#666] transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openIndex === index && (
                  <div className="pb-3 space-y-1">
                    {link.dropdown.map(item => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block text-sm text-[#666] py-2 px-3 rounded-lg hover:bg-[#F5F5F5] hover:text-[#1A1A1A] transition-colors"
                        onClick={onClose}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={link.href}
                className="block text-lg font-medium py-4"
                onClick={onClose}
              >
                {link.label}
              </Link>
            )}
          </div>
        ))}
        <div className="border-b border-[#E5E5E5]">
          <Link
            to="/account"
            className="block text-lg font-medium py-4"
            onClick={onClose}
          >
            Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const location = useLocation();
  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = (index: number) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(index);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'bg-white/70 backdrop-blur-xl border-white/30'
            : 'bg-white border-[#E5E5E5]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/Logo.png" alt="UniStyle" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.dropdown ? handleMouseEnter(index) : undefined}
                onMouseLeave={link.dropdown ? handleMouseLeave : undefined}
              >
                <Link
                  to={link.href}
                  className={`flex items-center gap-1 text-sm font-medium tracking-wide pb-1 border-b-2 transition-colors ${
                    location.pathname === link.href
                      ? 'border-[#1A1A1A] text-[#1A1A1A]'
                      : 'border-transparent text-[#1A1A1A] hover:border-[#1A1A1A]'
                  }`}
                >
                  {link.label}
                  {link.dropdown && <ChevronDown size={14} />}
                </Link>

                {link.dropdown && activeDropdown === index && (
                  <div
                    className="absolute top-full left-0 mt-2 min-w-[200px] z-50 rounded-2xl border border-white/50 overflow-hidden animate-liquid-glass-in"
                    style={{
                      background: 'rgba(255,255,255,0.65)',
                      backdropFilter: 'blur(48px)',
                      WebkitBackdropFilter: 'blur(48px)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 16px 40px rgba(0,0,0,0.12)',
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
                    <div className="py-2">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-white/50 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1 hover:opacity-70 transition-opacity"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link to="/account" className="p-1 hover:opacity-70 transition-opacity" aria-label="Account">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link to="/wishlist" className="relative hidden sm:block p-1 hover:opacity-70 transition-opacity" aria-label="Wishlist">
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1A1A1A] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-1 hover:opacity-70 transition-opacity" aria-label="Cart">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1A1A1A] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 hover:opacity-70 transition-opacity"
              aria-label="Menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[55] flex items-start justify-center pt-24 px-4"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl border border-white/40 animate-liquid-glass-in"
            style={{
              background: 'rgba(255,255,255,0.22)',
              backdropFilter: 'blur(48px)',
              WebkitBackdropFilter: 'blur(48px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 32px 64px rgba(0,0,0,0.22)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Specular rim */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-t-3xl pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/25 to-transparent rounded-t-3xl pointer-events-none" />

            <div className="p-6">
              <div className="flex items-center gap-3 bg-white/50 border border-white/50 rounded-2xl px-4 py-3 mb-5">
                <Search size={18} className="text-[#666] shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for products, categories..."
                  className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder:text-[#999] text-sm"
                />
                <button onClick={() => setSearchOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/70 transition-colors shrink-0">
                  <X size={14} className="text-[#1A1A1A]" />
                </button>
              </div>
              <div>
                <h3 className="text-xs font-medium text-[#999] uppercase tracking-wider mb-3">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {['Hoodies', 'Sweatshirts', 'Joggers', 'Caps', 'Tote Bags'].map(term => (
                    <Link
                      key={term}
                      to={`/shop?category=${term}`}
                      onClick={() => setSearchOpen(false)}
                      className="px-3 py-1.5 rounded-xl text-sm text-[#1A1A1A] transition-colors"
                      style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.5)' }}
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <MobileMenu navLinks={navLinks} onClose={() => setMobileMenuOpen(false)} />
      )}
    </>
  );
}
