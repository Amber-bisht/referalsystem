import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RedeemModal from '../components/RedeemModal';

const Earnings = () => {
    const { user, refreshUser } = useAuth();
    const [isRedeemOpen, setIsRedeemOpen] = useState(false);

    if (!user) return <div className="p-8 text-xs font-mono text-slate-400">LOADING EARNINGS...</div>;

    const currentBalance = (user.earnings?.total || 0) - (user.earnings?.withdrawn || 0);

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 pb-24 font-sans text-slate-900">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-16 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase mb-2">Earnings Dashboard</h1>
                    <p className="text-2xl font-light tracking-tight text-slate-900">My Earnings</p>
                </div>
                <button
                    onClick={() => setIsRedeemOpen(true)}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm"
                >
                    Withdraw Balance
                </button>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-100 rounded-sm mb-16 overflow-hidden">
                <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Available Balance</p>
                    <p className="text-3xl font-mono font-medium tracking-tighter">₹{currentBalance.toLocaleString('en-IN')}</p>
                    <div className="mt-8 pt-6 border-t border-slate-100/50">
                        <p className="text-[10px] text-slate-500 font-medium">Total Earned: <span className="font-mono ml-2 text-slate-900">₹{user.earnings?.total || 0}</span></p>
                    </div>
                </div>
                
                <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Direct Referrals</p>
                    <p className="text-xl font-mono font-medium">₹{user.earnings?.direct || 0}</p>
                    <span className="text-[9px] font-medium text-slate-400 mt-2 block uppercase tracking-wider">Level 1 Earnings (5%)</span>
                </div>

                <div className="p-8">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Network Referrals</p>
                    <p className="text-xl font-mono font-medium">₹{user.earnings?.indirect || 0}</p>
                    <span className="text-[9px] font-medium text-slate-400 mt-2 block uppercase tracking-wider">Level 2 Earnings (1%)</span>
                </div>
            </div>

            {/* Ledger Section */}
            <div className="space-y-12">
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Withdrawal History</h2>
                        <div className="h-[1px] flex-1 bg-slate-100"></div>
                    </div>
                    
                    {user.withdrawalHistory?.length === 0 ? (
                        <div className="py-16 border border-slate-100 border-dashed rounded-sm text-center bg-slate-50/20">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">No withdrawals recorded yet</p>
                        </div>
                    ) : (
                        <div className="border border-slate-100 rounded-sm overflow-hidden">
                            <table className="w-full text-left bg-white">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Reward Brand</th>
                                        <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Reference Code</th>
                                        <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {user.withdrawalHistory.slice().reverse().map((w, index) => (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-5 text-[10px] font-mono text-slate-400">
                                                {new Date(w.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.')}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                                    <span className="text-[11px] font-medium text-slate-700 uppercase tracking-wider">{w.brand}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    <span className="font-mono text-[10px] bg-slate-50 px-3 py-1 rounded-sm border border-slate-100 text-slate-500 group-hover:text-slate-900 transition-colors">
                                                        {w.couponCode}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="font-mono text-xs font-medium text-slate-900">-₹{w.amount.toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
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
