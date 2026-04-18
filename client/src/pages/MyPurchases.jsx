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
            <h1 className="text-3xl font-black text-slate-900 mb-10 text-center md:text-left tracking-tighter">Digital Voucher Vault</h1>

            {history.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4v-3a2 2 0 00-2-2H5z"/></svg>
                    </div>
                    <p className="text-xl font-bold text-slate-900 mb-2">Your vault is empty</p>
                    <p className="text-sm text-slate-400 mb-8 font-medium">Mint your first gift card to generate a unique voucher code.</p>
                    <Link to="/dashboard" className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Go to Minting Hub</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {history.slice().reverse().map((order, index) => (
                        <div key={index} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center p-6 gap-6">
                            <div className="w-32 h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 p-2">
                                <img src={order.productImage} alt={order.productName} className="w-full h-full object-contain" />
                            </div>
                            
                            <div className="flex-1 text-center md:text-left">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Brand Voucher</span>
                                <h3 className="text-lg font-black text-slate-900 leading-tight">{order.productName}</h3>
                                <p className="text-xs text-slate-400 mt-1 font-medium italic">Unlocked: {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>

                            <div className="flex flex-col items-center md:items-end gap-3 bg-slate-50 px-8 py-5 rounded-2xl border border-slate-100 w-full md:w-auto">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Redemption Code</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xl font-black text-slate-900 selection:bg-slate-900 selection:text-white">
                                        {order.voucherCode || 'GENERATING...'}
                                    </span>
                                    <button 
                                        onClick={() => {
                                            if (order.voucherCode) {
                                                navigator.clipboard.writeText(order.voucherCode);
                                                alert('Voucher code copied to clipboard!');
                                            }
                                        }}
                                        className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"
                                        title="Copy to clipboard"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col items-center md:items-end justify-center">
                                <span className="text-2xl font-black text-slate-900 leading-none">₹{order.price}</span>
                                <div className="mt-2 text-[9px] font-black bg-emerald-600 text-white px-3 py-1 uppercase tracking-widest italic rounded-full">Liquidated</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPurchases;
