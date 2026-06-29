import { Link } from 'react-router-dom';

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.28 8.28 0 0 0 4.83 1.54V6.81a4.85 4.85 0 0 1-1.07-.12z"/>
    </svg>
  );
}

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
    </svg>
  );
}

function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-16 pb-0">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img src="/Logo.png" alt="UniStyle" className="h-14 w-auto" />
            </Link>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white mb-6">Shop</h4>
            <ul className="space-y-4">
              <li><Link to="/shop?gender=men" className="text-sm text-[#999] hover:text-white transition-colors">Men</Link></li>
              <li><Link to="/shop?gender=women" className="text-sm text-[#999] hover:text-white transition-colors">Women</Link></li>
              <li><Link to="/shop" className="text-sm text-[#999] hover:text-white transition-colors">Universities</Link></li>
              <li><Link to="/shop?category=Accessories" className="text-sm text-[#999] hover:text-white transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/account" className="text-sm text-[#999] hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/account" className="text-sm text-[#999] hover:text-white transition-colors">Shipping</Link></li>
              <li><Link to="/account" className="text-sm text-[#999] hover:text-white transition-colors">Returns</Link></li>
              <li><Link to="/account" className="text-sm text-[#999] hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/account" className="text-sm text-[#999] hover:text-white transition-colors">About</Link></li>
              <li><Link to="/account" className="text-sm text-[#999] hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/account" className="text-sm text-[#999] hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/account" className="text-sm text-[#999] hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#2A2A2A] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#666]">© 2026 UniStyle</p>
          <div className="flex items-center gap-5">
            <a href="#" aria-label="Instagram" className="text-[#666] hover:text-white transition-colors"><InstagramIcon size={19} /></a>
            <a href="#" aria-label="TikTok" className="text-[#666] hover:text-white transition-colors"><TikTokIcon size={19} /></a>
            <a href="#" aria-label="X" className="text-[#666] hover:text-white transition-colors"><XIcon size={19} /></a>
            <a href="#" aria-label="LinkedIn" className="text-[#666] hover:text-white transition-colors"><LinkedInIcon size={19} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
