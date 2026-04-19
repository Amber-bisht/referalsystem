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

    if (!user) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading purchase history...</div>;

    const purchases = (user.purchaseHistory || []).map(p => ({
        ...p,
        type: 'Purchase',
        displayLabel: 'Direct Purchase'
    }));

    const redemptions = (user.withdrawalHistory || []).map(w => {
        // Try to find image from shop products by brand name matching
        const productMatch = shopProducts.find(p => p.name.toLowerCase().includes(w.brand.toLowerCase()));
        return {
            _id: w._id,
            productName: w.brand,
            productImage: productMatch ? productMatch.imageUrl : null,
            price: w.amount,
            date: w.date,
            voucherCode: w.couponCode,
            type: 'Redemption',
            displayLabel: 'Reward Redemption'
        };
    });

    const combinedHistory = [...purchases, ...redemptions].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">My Items</h1>
                <Link 
                    to="/dashboard" 
                    className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all text-center shadow-md active:scale-95"
                >
                    Visit Shop
                </Link>
            </div>

            {combinedHistory.length === 0 ? (
                <div className="text-center py-24 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No items found</h2>
                    <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">Acquire your first gift card through purchase or referral reward redemption.</p>
                    <Link to="/dashboard" className="px-10 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-slate-900 transition-all">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {combinedHistory.map((item, index) => (
                        <div key={index} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm p-6 group">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                {/* Product Image */}
                                <div className="w-32 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 p-2 flex items-center justify-center">
                                    {item.productImage ? (
                                        <img src={item.productImage} alt={item.productName} className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <div className="text-slate-200">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 justify-center md:justify-start">
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.productName}</h3>
                                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md w-fit mx-auto md:mx-0 border ${
                                            item.type === 'Purchase' 
                                            ? 'bg-blue-50 text-blue-500 border-blue-100' 
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                            {item.displayLabel}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <p className="text-xs text-slate-400 font-medium tracking-wide">
                                            {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                        <span className="text-[10px] font-bold text-slate-900 uppercase">₹{item.price.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Voucher Code Section */}
                                <div className="flex flex-col items-center md:items-end gap-2 px-6 py-4 bg-slate-50 rounded-xl border border-slate-100 w-full md:w-auto">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Voucher Code</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-lg font-black text-slate-900 tracking-wider">
                                            {item.voucherCode || 'PENDING...'}
                                        </span>
                                        <button 
                                            onClick={() => {
                                                if (item.voucherCode) {
                                                    navigator.clipboard.writeText(item.voucherCode);
                                                    alert('Voucher code copied!');
                                                }
                                            }}
                                            className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 rounded-lg transition-all"
                                            title="Copy Code"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-center">
                                    <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm ${
                                        item.type === 'Purchase' ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
                                    }`}>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPurchases;
