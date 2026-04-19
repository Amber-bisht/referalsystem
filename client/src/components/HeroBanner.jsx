import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HeroBanner = ({ banners, isLoading }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!banners || banners.length <= 1 || isLoading) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [banners, isLoading]);

    if (isLoading) {
        return (
            <div className="relative w-full overflow-hidden bg-slate-50 animate-pulse" style={{ height: 'clamp(300px, 45vh, 500px)' }}>
                <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-6 md:px-12 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="h-10 bg-slate-100 rounded-lg w-3/4"></div>
                            <div className="h-4 bg-slate-100/50 rounded-md w-1/2"></div>
                        </div>
                        <div className="hidden md:block">
                            <div className="aspect-[16/9] bg-slate-100 rounded-3xl w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!banners || banners.length === 0) return null;

    const banner = banners[currentIndex];

    return (
        <section className="relative bg-white overflow-hidden border-b border-slate-100 w-full group">
            <Link 
                to={banner.productSlug ? `/${banner.productSlug}` : '/'}
                className="block px-8 md:px-20 pt-8 pb-16 md:pt-12 md:pb-20 hover:opacity-[0.98] transition-opacity"
            >
                <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-12" key={currentIndex}>
                    {/* Left Side: Content (Taking 5 columns) */}
                    <div className="md:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-bold text-[#1a3321] tracking-tight leading-tight">
                                {banner.title}
                            </h2>
                            <p className="text-slate-500 text-base md:text-lg font-medium max-w-sm leading-relaxed">
                                {banner.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-8">
                            <span 
                                className="group/btn flex items-center gap-4 text-[#1a3321] font-bold text-base border-b-2 border-[#1a3321] pb-1"
                            >
                                Buy now
                            </span>
                        </div>
                    </div>

                    {/* Right Side: Image (Taking 7 columns - Wider) */}
                    <div className="md:col-span-7 relative aspect-[21/9] animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
                        <img 
                            src={banner.imageUrl} 
                            alt={banner.title}
                            className="w-full h-full object-cover rounded-3xl shadow-xl border border-slate-50"
                        />
                    </div>
                </div>
            </Link>

            {/* Navigation Dots */}
            {banners.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 transition-all duration-300 rounded-full ${
                                currentIndex === idx ? 'w-8 bg-[#1a3321]' : 'w-2 bg-slate-200 hover:bg-slate-300'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default HeroBanner;
