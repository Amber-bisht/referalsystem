import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RedeemModal from '../components/RedeemModal';

const Earnings = () => {
    const { user, refreshUser } = useAuth();
    const [isRedeemOpen, setIsRedeemOpen] = useState(false);

    if (!user) return <div>Loading...</div>;

    const currentBalance = (user.earnings?.total || 0) - (user.earnings?.withdrawn || 0);

    return (
        <div className="container mx-auto px-4 pb-20">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter">Earnings Dashboard</h1>
                <button
                    onClick={() => setIsRedeemOpen(true)}
                    className="bg-black text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95"
                >
                    Withdraw Funds
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="card text-center p-8 bg-black text-white rounded-3xl col-span-1 md:col-span-2">
                    <h3 className="text-gray-400 uppercase text-xs font-bold tracking-[0.2em] mb-2">Available Balance</h3>
                    <p className="text-4xl md:text-6xl font-black italic tracking-tighter text-green-400">₹{currentBalance}</p>
                    <p className="text-gray-500 text-xs mt-4 uppercase">Total Earned: ₹{user.earnings?.total || 0}</p>
                </div>
                
                <div className="card text-center p-8 rounded-3xl border-2 border-gray-100 flex flex-col justify-center">
                    <h3 className="text-gray-500 uppercase text-xs font-bold tracking-widest mb-1">Direct</h3>
                    <p className="text-2xl font-black">₹{user.earnings?.direct || 0}</p>
                    <small className="text-gray-400 font-bold">LEVEL 1</small>
                </div>

                <div className="card text-center p-8 rounded-3xl border-2 border-gray-100 flex flex-col justify-center">
                    <h3 className="text-gray-500 uppercase text-xs font-bold tracking-widest mb-1">Indirect</h3>
                    <p className="text-2xl font-black">₹{user.earnings?.indirect || 0}</p>
                    <small className="text-gray-400 font-bold">LEVEL 2</small>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card p-8 bg-gray-50 rounded-3xl border-none">
                    <h3 className="text-lg font-black mb-6 uppercase italic tracking-tighter">Profit Distribution</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                            <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">5%</span>
                            <span className="text-sm text-gray-600">Earnings from direct referral purchases (Level 1).</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">1%</span>
                            <span className="text-sm text-gray-600">Earnings from indirect referral purchases (Level 2).</span>
                        </li>
                        <li className="flex items-start gap-4 text-xs text-gray-400 uppercase font-bold tracking-widest pt-4 border-t">
                            Min Purchase Value: ₹1000
                        </li>
                    </ul>
                </div>

                <div className="card p-8 bg-zinc-900 text-white rounded-3xl border-none overflow-hidden relative">
                    <h3 className="text-lg font-black mb-4 uppercase italic tracking-tighter relative z-10">Instant Redemptions</h3>
                    <p className="text-sm text-gray-400 mb-6 relative z-10">Redeem your earnings for shopping & travel vouchers from India's top brands instantly.</p>
                    <div className="flex gap-4 relative z-10 opacity-50 grayscale">
                        <img src="https://promos.makemytrip.com/appfest/2x/580x346-BestWishes-2.png" className="h-12 w-20 object-cover rounded-lg" alt="MMT" />
                        <img src="https://b2cstatic.woohoo.in/media/catalog/product/z/e/zepto.png?appId=12" className="h-12 w-20 object-cover rounded-lg" alt="Zepto" />
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
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
