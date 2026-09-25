interface PageBannerProps {
  title: string;
  subtitle?: string;
}

export function PageBanner({ title, subtitle }: PageBannerProps) {
  return (
    <div className="relative bg-[#1A1A1A] h-[220px] md:h-[300px] flex flex-col items-center justify-center text-white">
      <div className="absolute inset-0 opacity-30">
        <img src="/blog-1.jpg" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="relative z-10 text-center px-6">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">{title}</h1>
        {subtitle && <p className="mt-3 text-sm text-white/70">{subtitle}</p>}
      </div>
    </div>
  );
}
