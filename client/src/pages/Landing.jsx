import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div></div>;
    if (user) return <Navigate to="/shop" />;

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 pt-4 pb-12 md:pt-6 md:pb-16 text-center">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                    Luxury accessories, <br className="hidden md:block" />
                    <span className="text-slate-400">reimagined for you.</span>
                </h1>
                
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-12 leading-relaxed">
                    A curated collection of premium essentials. Join our exclusive referral network and earn rewards while you shop.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/signup"
                        className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                    >
                        Join the Network
                    </Link>
                    <Link
                        to="/login"
                        className="w-full sm:w-auto px-10 py-4 bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl hover:border-slate-900 transition-all"
                    >
                        Sign In
                    </Link>
                </div>
            </div>

            {/* Visual Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="group overflow-hidden rounded-2xl border border-slate-100 aspect-[4/5]">
                        <img src="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRKVlVohhI3k4G1eQ69GqsqEA89DAGQiRRxltN5_9Z8rNvFR5SvABeN4dnCZxbEgAtBq2jIW4tXT_M" alt="Watch" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                    </div>
                    <div className="group overflow-hidden rounded-2xl border border-slate-100 aspect-[4/5] mt-8 md:mt-12">
                        <img src="https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/2025/AUGUST/28/aPnJ2QOF_c09ea20cbf62415cbddc6c49d3dc99f5.jpg" alt="Bag" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                    </div>
                    <div className="group overflow-hidden rounded-2xl border border-slate-100 aspect-[4/5]">
                        <img src="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSHgDFsPH-xeizxqLbJXRSXL-Jj0_Wt3xPxysx8xSF-swm4Bm1l" alt="Glasses" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                    </div>
                    <div className="group overflow-hidden rounded-2xl border border-slate-100 aspect-[4/5] mt-8 md:mt-12">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKlpox488T6I75L8djnqWg3AVN96xVEdRytw&s" alt="Phone" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Landing;
