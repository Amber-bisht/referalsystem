import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading profile data...</div>;

    const referralLink = `${window.location.origin}/signup?ref=${user.referralCode}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        alert('Referral link copied!');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-10">Account Settings</h1>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-8 mb-8 space-y-10">
                {/* Identity Section */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-slate-50 gap-2 font-sans tracking-tight">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest self-start pt-1">Email Address</span>
                        <span className="text-sm font-bold text-slate-900 break-all">{user.email}</span>
                    </div>
                    


                    <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-slate-50 gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest self-start pt-1">Total Earnings</span>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-slate-900">
                                ₹{(user.earnings?.total || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Referral Assets */}
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                    <div className="mb-8">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Your Referral Code</h3>
                        <div className="bg-white py-5 rounded-2xl border border-slate-100 text-center shadow-sm">
                            <span className="text-4xl font-mono font-black tracking-[0.2em] text-slate-900 uppercase">
                                {user.referralCode}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Share Referral Link</h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                readOnly
                                value={referralLink}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-md whitespace-nowrap"
                            >
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
