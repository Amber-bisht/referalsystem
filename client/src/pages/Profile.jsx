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
        <div className="container mx-auto px-4 py-8 max-w-2xl text-slate-900">
            <h1 className="text-3xl font-bold mb-10">Account Settings</h1>
            
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-8 mb-8 space-y-8">
                {/* User Info */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-slate-50 gap-1">
                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Username</span>
                        <span className="text-lg font-bold">{user.username}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-slate-50 gap-1">
                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Email</span>
                        <span className="text-lg font-bold break-all">{user.email}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-slate-50 gap-1">
                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Financial Status</span>
                        <span className="text-2xl font-bold text-slate-900">₹{user.earnings?.total || 0} <span className="text-xs font-medium text-slate-400 italic">Total Earned</span></span>
                    </div>
                </div>

                {/* Referral Section */}
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                    <div className="mb-6">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Your Referral Identity</h3>
                        <div className="bg-white px-2 py-4 rounded-xl border border-slate-100 text-center">
                            <span className="text-4xl font-mono font-bold tracking-[0.2em] text-slate-900 uppercase">
                                {user.referralCode}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Sharing Link</h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                readOnly
                                value={referralLink}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                            />
                            <button 
                                onClick={copyToClipboard} 
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm whitespace-nowrap"
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
