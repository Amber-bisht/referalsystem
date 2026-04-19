import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RedeemModal from '../components/RedeemModal';

const Earnings = () => {
    const { user, refreshUser } = useAuth();
    const [isRedeemOpen, setIsRedeemOpen] = useState(false);

    if (!user) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading earnings data...</div>;

    const currentBalance = (user.earnings?.total || 0) - (user.earnings?.withdrawn || 0);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Earnings Dashboard</h1>
                <button
                    onClick={() => setIsRedeemOpen(true)}
                    className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
                >
                    Withdraw Balance
                </button>
            </div>

            {/* Main Balance Card */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm p-8 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Available Balance</h2>
                        <p className="text-sm text-slate-500 font-medium">Your settled earnings available for immediate withdrawal.</p>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="text-slate-400 font-bold text-xl">₹</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{currentBalance.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-50">
                    <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
                        <p className="text-xl font-bold text-slate-900">₹{(user.earnings?.total || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Direct Referrals</p>
                        <p className="text-xl font-bold text-slate-900">₹{(user.earnings?.direct || 0).toLocaleString()}</p>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-2 block italic">Level 1 (Direct)</span>
                    </div>
                    <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Network Referrals</p>
                        <p className="text-xl font-bold text-slate-900">₹{(user.earnings?.indirect || 0).toLocaleString()}</p>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-2 block italic">Level 2 (Network)</span>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Withdrawal History</h2>
                    <p className="text-sm text-slate-500 font-medium">Log of all reward redemptions and asset liquidations.</p>
                </div>
                
                {user.withdrawalHistory?.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">No withdrawals recorded yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Reward Brand</th>
                                    <th className="px-8 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Reference Code</th>
                                    <th className="px-8 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {user.withdrawalHistory.slice().reverse().map((w, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5 text-xs font-medium text-slate-500">
                                            {new Date(w.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">{w.brand}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                <span className="font-mono text-[10px] bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-slate-400 group-hover:text-slate-900 transition-colors tracking-wider">
                                                    {w.couponCode}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="font-bold text-sm text-slate-900">₹{w.amount.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
