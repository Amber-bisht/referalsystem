import { useAuth } from '../context/AuthContext';

const MyPurchases = () => {
    const { user } = useAuth(); // User object now includes purchaseHistory if utilizing the updated /auth/user endpoint or refreshing it

    // Note: ensure the backend /auth/user endpoint actually returns purchaseHistory. 
    // It usually returns the whole user object minus password, so it should be there.

    if (!user) return <div>Loading...</div>;

    const history = user.purchaseHistory || [];

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8 uppercase tracking-wide">My Order History</h1>

            {history.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-xl text-gray-500 mb-4">You haven't placed any orders yet.</p>
                    <a href="/shop" className="btn btn-primary">Start Shopping</a>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="py-4 px-4 font-bold uppercase tracking-wider text-sm">Date</th>
                                <th className="py-4 px-4 font-bold uppercase tracking-wider text-sm">Product</th>
                                <th className="py-4 px-4 font-bold uppercase tracking-wider text-sm text-right">Price</th>
                                <th className="py-4 px-4 font-bold uppercase tracking-wider text-sm text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.slice().reverse().map((order, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 text-gray-600">
                                        {new Date(order.date).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-4 font-medium">{order.productName}</td>
                                    <td className="py-4 px-4 text-right">₹{order.price}</td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`text-[10px] px-3 py-1 font-black tracking-widest uppercase rounded ${
                                            order.status === 'Shipping Done' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Shipping Started' ? 'bg-blue-100 text-blue-700' : 
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {order.status || 'Payment Successful'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyPurchases;
