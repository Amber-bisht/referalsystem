import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return <div>Loading...</div>;

    const referralLink = `${window.location.origin}/signup?ref=${user.referralCode}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        alert('Referral link copied!');
    };

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8 uppercase tracking-wide">My Profile</h1>
            <div className="card max-w-2xl mx-auto p-4 md:p-8">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-4">
                        <span className="text-gray-500 font-medium">Username</span>
                        <span className="font-bold text-lg">{user.username}</span>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-4">
                        <span className="text-gray-500 font-medium">Email</span>
                        <span className="font-bold text-lg break-all">{user.email}</span>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-4">
                        <span className="text-gray-500 font-medium">Total Lifetime Earnings</span>
                        <span className="text-2xl md:text-3xl font-bold text-green-600">₹{user.earnings?.total || 0}</span>
                    </div>

                    <div className="mt-6 bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-100">
                        <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2 tracking-wider">Your Referral Code</h3>
                        <div className="text-2xl md:text-4xl font-mono font-bold text-center tracking-widest md:tracking-[0.5em] mb-6 break-all">{user.referralCode}</div>

                        <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2 tracking-wider">Referral Link</h3>
                        <div className="flex flex-col md:flex-row gap-2">
                            <input
                                type="text"
                                readOnly
                                value={referralLink}
                                className="input bg-white w-full"
                            />
                            <button onClick={copyToClipboard} className="btn btn-primary whitespace-nowrap">Copy Link</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
