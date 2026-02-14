import { useAuth } from '../context/AuthContext';

const Earnings = () => {
    const { user } = useAuth();

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8 uppercase tracking-wide">Earnings Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="card text-center p-8 bg-black text-white">
                    <h3 className="text-gray-300 uppercase text-sm tracking-wider">Total Earnings</h3>
                    <p className="text-2xl md:text-4xl font-bold mt-2 text-green-400">₹{user.earnings?.total || 0}</p>
                </div>
                <div className="card text-center p-8">
                    <h3 className="text-gray-500 uppercase text-sm tracking-wider">Direct (Level 1)</h3>
                    <p className="text-2xl md:text-3xl font-bold mt-2">₹{user.earnings?.direct || 0}</p>
                    <small className="text-gray-400 mt-2 block">5% Commission</small>
                </div>
                <div className="card text-center p-8">
                    <h3 className="text-gray-500 uppercase text-sm tracking-wider">Indirect (Level 2)</h3>
                    <p className="text-2xl md:text-3xl font-bold mt-2">₹{user.earnings?.indirect || 0}</p>
                    <small className="text-gray-400 mt-2 block">1% Commission</small>
                </div>
            </div>

            <div className="card p-8 bg-gray-50">
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">Profit Distribution Logic</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>You earn <strong className="text-black">5%</strong> from purchases made by your direct referrals (Level 1).</li>
                    <li>You earn <strong className="text-black">1%</strong> from purchases made by users referred by your direct referrals (Level 2).</li>
                    <li>Earnings are only distributed for purchases exceeding <strong className="text-black">₹1000</strong>.</li>
                </ul>
            </div>
        </div>
    );
};

export default Earnings;
