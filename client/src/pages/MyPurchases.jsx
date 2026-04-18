import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyPurchases = () => {
    const { user } = useAuth();
    const [shopProducts, setShopProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('/shop/products');
                setShopProducts(res.data);
            } catch (err) {
                console.error('Error fetching shop products:', err);
            }
        };
        fetchProducts();
    }, []);

    if (!user) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading order history...</div>;

    const history = user.purchaseHistory || [];

    // Helper to get image for old orders
    const getProductImage = (order) => {
        if (order.productImage) return order.productImage;
        const shopItem = shopProducts.find(p => p._id === order.productId);
        return shopItem?.imageUrl || null;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-10 text-center md:text-left">Order History</h1>

            {history.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-3xl">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    </div>
                    <p className="text-lg font-bold text-slate-900 mb-2">No orders found</p>
                    <p className="text-sm text-slate-500 mb-6 font-medium">You haven't purchased any accessories yet.</p>
                    <Link to="/shop" className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm">Explore Shop</Link>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="py-4 px-6 font-semibold text-slate-500">Item</th>
                                    <th className="py-4 px-6 font-semibold text-slate-500 hidden md:table-cell">Purchase Date</th>
                                    <th className="py-4 px-6 font-semibold text-slate-500 text-right">Price</th>
                                    <th className="py-4 px-6 font-semibold text-slate-500 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {history.slice().reverse().map((order, index) => {
                                    const productImage = getProductImage(order);
                                    return (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                                                        {productImage ? (
                                                            <img src={productImage} alt={order.productName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="block font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                                                            {order.productName}
                                                        </span>
                                                        <span className="md:hidden text-[10px] text-slate-400 font-medium">
                                                            {new Date(order.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-slate-500 font-medium hidden md:table-cell">
                                                {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="py-5 px-6 text-right font-black text-slate-900">₹{order.price}</td>
                                            <td className="py-5 px-6 text-center">
                                                <div className={`inline-block px-3 py-1 rounded-none text-[10px] font-bold tracking-wider ${
                                                    order.status === 'Shipping Done' ? 'bg-emerald-600 text-white' :
                                                    order.status === 'Shipping Started' ? 'bg-blue-600 text-white' : 
                                                    'bg-slate-600 text-white'
                                                }`}>
                                                    {order.status || 'VERIFIED'}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPurchases;
