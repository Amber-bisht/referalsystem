import { useAuth } from '../context/AuthContext';

const Referrals = () => {
    const { user } = useAuth();

    if (!user) return <div>Loading...</div>;

    const maxReferrals = 8;
    const currentReferrals = user.directReferrals?.length || 0;
    const slots = Array.from({ length: maxReferrals }, (_, i) => i < currentReferrals);

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8 uppercase tracking-wide">Referral Management</h1>

            <div className="card p-8 mb-8">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold">Your Network Slots</h2>
                    <span className="text-lg font-mono font-bold bg-black text-white px-3 py-1 rounded">{currentReferrals} / {maxReferrals} Used</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    {slots.map((isFilled, index) => (
                        <div
                            key={index}
                            className={`flex flex-col justify-center items-center p-4 md:p-6 rounded-lg border-2 transition-all duration-300
                                ${isFilled
                                    ? 'bg-black text-white border-black scale-105 shadow-md'
                                    : 'bg-white text-gray-300 border-gray-200 border-dashed'}`}
                            style={{ height: '140px' }}
                        >
                            <span className="text-2xl md:text-3xl font-bold mb-1">{index + 1}</span>
                            <span className="text-[10px] md:text-xs uppercase tracking-widest">{isFilled ? 'Occupied' : 'Empty'}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card p-8 bg-gray-50 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold mb-1">Grow Your Network</h3>
                    <p className="text-gray-600">Share your unique code to fill your slots.</p>
                </div>
                <a href="/profile" className="btn btn-outline">Get Code</a>
            </div>
        </div>
    );
};

export default Referrals;
