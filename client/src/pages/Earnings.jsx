import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RedeemModal from '../components/RedeemModal';

const Earnings = () => {
    const { user, refreshUser } = useAuth();
    const [isRedeemOpen, setIsRedeemOpen] = useState(false);

    if (!user) return <div>Loading...</div>;

    const currentBalance = (user.earnings?.total || 0) - (user.earnings?.withdrawn || 0);

    return (
        <div className="container mx-auto px-4 py-8 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <h1 className="text-3xl font-bold text-slate-900">Earnings</h1>
                <button
                    onClick={() => setIsRedeemOpen(true)}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                >
                    Redeem Balance
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl md:col-span-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available to Withdraw</p>
                    <p className="text-4xl font-bold text-slate-900">₹{currentBalance}</p>
                    <p className="text-xs text-slate-500 mt-4">Total Earned: ₹{user.earnings?.total || 0}</p>
                </div>
                
                <div className="p-8 border border-slate-100 rounded-2xl flex flex-col justify-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Direct Referrals</p>
                    <p className="text-2xl font-bold text-slate-900">₹{user.earnings?.direct || 0}</p>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Level 1 (5%)</span>
                </div>

                <div className="p-8 border border-slate-100 rounded-2xl flex flex-col justify-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Indirect Referrals</p>
                    <p className="text-2xl font-bold text-slate-900">₹{user.earnings?.indirect || 0}</p>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Level 2 (1%)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Commission Structure</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Direct Purchases (L1)</span>
                            <span className="text-sm font-bold text-slate-900">5.0%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Indirect Purchases (L2)</span>
                            <span className="text-sm font-bold text-slate-900">1.0%</span>
                        </div>
                        <div className="pt-6 border-t border-slate-200">
                            <p className="text-xs text-slate-400 italic">Redemptions are triggered instantly upon successful referral payment.</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 border border-slate-100 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Gift Voucher Redemption</h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed">Instantly convert your commission into top-tier brand vouchers from MMT, Zepto, and more.</p>
                    </div>
                    <div className="flex gap-6">
                        <img src="https://promos.makemytrip.com/appfest/2x/580x346-BestWishes-2.png" className="h-8 rounded" alt="MMT" />
                        <img src="https://b2cstatic.woohoo.in/media/catalog/product/z/e/zepto.png?appId=12" className="h-8 rounded" alt="Zepto" />
                    </div>
                </div>
            </div>

            <RedeemModal 
                isOpen={isRedeemOpen} 
                onClose={() => setIsRedeemOpen(false)}
                currentBalance={currentBalance}
                onRedeemSuccess={() => refreshUser()}
            />
        </div>
    );
};

export default Earnings;
