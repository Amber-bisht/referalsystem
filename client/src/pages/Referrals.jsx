import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Referrals = () => {
    const { user } = useAuth();

    if (!user) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading referral data...</div>;

    const maxReferrals = 8;
    const currentReferrals = user.directReferrals?.length || 0;
    const slots = Array.from({ length: maxReferrals }, (_, i) => i < currentReferrals);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-10">Referral Network</h1>

            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm p-8 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Affiliate Active Slots</h2>
                        <p className="text-sm text-slate-500 font-medium">Your authorized referral limit for Tier 1 Royalties.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm">
                        <span>{currentReferrals}</span>
                        <span className="text-slate-500">/</span>
                        <span>{maxReferrals}</span>
                        <span className="ml-1 opacity-50">Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {slots.map((isFilled, index) => (
                        <div
                            key={index}
                            className={`flex flex-col justify-center items-center py-8 rounded-xl border transition-all duration-300
                                ${isFilled
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-4 ring-slate-900/10'
                                    : 'bg-white text-slate-300 border-slate-100 border-dashed hover:border-slate-200'}`}
                        >
                            <span className={`text-3xl font-bold mb-1 ${isFilled ? 'text-white' : 'text-slate-200'}`}>
                                {index + 1}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isFilled ? 'text-slate-400' : 'text-slate-300'}`}>
                                {isFilled ? 'Occupied' : 'Inactive'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Invite & Earn</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Share your unique referral link to fill your slots and unlock passive commissions.</p>
                </div>
                <Link 
                    to="/profile" 
                    className="w-full sm:w-auto px-8 py-3 bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl hover:border-slate-900 transition-all text-center"
                >
                    Get Referral Code
                </Link>
            </div>
        </div>
    );
};

export default Referrals;
