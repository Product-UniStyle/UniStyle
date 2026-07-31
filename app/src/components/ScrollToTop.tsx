import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    // Skip on back/forward (POP) navigations — that's exactly when a page may want
    // to restore its previous scroll position (see ShopPage's scroll restoration)
    // instead of being forced back to the top.
    if (navigationType === 'POP') return;
    window.scrollTo(0, 0);
  }, [pathname, navigationType]);
  return null;
}
