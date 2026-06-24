import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const agreed = localStorage.getItem('unistyle-cookies');
    if (!agreed) setVisible(true);
  }, []);

  const handleAgree = () => {
    localStorage.setItem('unistyle-cookies', 'true');
    setVisible(false);
  };

  const handleDisagree = () => {
    localStorage.setItem('unistyle-cookies', 'false');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#1A1A1A] text-white px-4 py-4 md:px-8">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-sm text-white/80">
          This website uses cookies to ensure you get the best experience on our website.
          <a href="#" className="underline ml-1 hover:text-white">Privacy Policy</a>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDisagree}
            className="text-sm text-white/70 hover:text-white transition-colors underline"
          >
            Not agree
          </button>
          <button
            onClick={handleAgree}
            className="text-sm bg-white/20 hover:bg-white/30 text-white px-4 py-2 transition-colors"
          >
            Agree
          </button>
        </div>
      </div>
    </div>
  );
}
