import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyPurchases = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/shop/my-orders');
                setOrders(res.data);
            } catch (err) {
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Synchronizing Orders</p>
        </div>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-blue-500';
            case 'Processing': return 'bg-amber-500';
            case 'Delivering': return 'bg-indigo-500';
            case 'Delivered': return 'bg-emerald-500';
            default: return 'bg-slate-400';
        }
    };

    const statusSteps = ['Confirmed', 'Processing', 'Delivering', 'Delivered'];

    return (
        <div className="container mx-auto px-6 py-12 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Order History</h1>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Track and manage your game deliveries.</p>
                </div>
                <Link 
                    to="/dashboard" 
                    className="group flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                >
                    Browse More Games
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-24 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h2>
                    <p className="text-slate-400 mb-8 max-w-xs mx-auto text-xs font-medium">Your collection is empty. Start your journey by exploring our latest titles.</p>
                    <Link to="/dashboard" className="px-10 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-slate-900 transition-all">Go To Shop</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const isExpanded = expandedOrderId === order._id;
                        return (
                            <div key={order._id} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        {/* Product Info */}
                                        <div className="flex flex-col md:flex-row items-center gap-6 lg:w-[35%]">
                                            <div className="w-28 h-20 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 p-2 flex items-center justify-center transition-transform duration-500">
                                                {order.productImage ? (
                                                    <img src={order.productImage} alt={order.productName} className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <div className="text-slate-200">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-sm border ${
                                                        order.paymentMethod === 'Wallet' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                                    }`}>
                                                        {order.paymentMethod === 'Wallet' ? 'Wallet' : 'Online'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-200">•</span>
                                                    <span className="text-sm font-black text-slate-900 tracking-tight">₹{order.amount.toLocaleString()}</span>
                                                </div>
                                                <h3 className="text-[13px] font-black text-slate-900 leading-tight mb-1 truncate max-w-[240px] uppercase tracking-tight">{order.productName}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Delivery Tracker */}
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${getStatusColor(order.status)}`}></div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-white ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            
                                            <div className="relative px-1">
                                                <div className="absolute top-[6px] left-0 w-full h-[2px] bg-slate-100 rounded-full"></div>
                                                <div 
                                                    className={`absolute top-[6px] left-0 h-[2px] bg-slate-900 rounded-full transition-all duration-[1000ms] ease-out`}
                                                    style={{ 
                                                        width: `${(statusSteps.indexOf(order.status) / (statusSteps.length - 1)) * 100}%` 
                                                    }}
                                                ></div>

                                                <div className="relative flex justify-between">
                                                    {statusSteps.map((step, idx) => {
                                                        const currentIndex = statusSteps.indexOf(order.status);
                                                        const isActive = currentIndex >= idx;
                                                        return (
                                                            <div key={step} className="flex flex-col items-center">
                                                                <div className={`w-3 h-3 rounded-full border-2 transition-all duration-700 z-10 ${
                                                                    isActive 
                                                                    ? 'bg-slate-900 border-white ring-2 ring-slate-900' 
                                                                    : 'bg-white border-slate-100'
                                                                }`}></div>
                                                                <span className={`text-[8px] font-bold uppercase mt-2.5 tracking-tight ${
                                                                    isActive ? 'text-slate-900' : 'text-slate-300'
                                                                }`}>
                                                                    {step}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expand Toggle */}
                                        <div className="lg:w-16 flex items-center justify-center">
                                            <button 
                                                onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                                                className={`p-2.5 rounded-lg border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all duration-300 ${isExpanded ? 'bg-slate-900 text-white border-slate-900 rotate-180' : 'bg-white'}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Details Section */}
                                {isExpanded && (
                                    <div className="bg-slate-50/50 border-t border-slate-100 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shipping Address</p>
                                            <p className="text-xs text-slate-700 font-bold leading-relaxed max-w-xs">
                                                {order.shippingAddress || "Not provided"}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Information</p>
                                            <p className="text-xs text-slate-900 font-black">
                                                {order.phoneNumber || "Not provided"}
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">Available for updates</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order Reference</p>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                                                    {order.paymentId || "PENDING"}
                                                </span>
                                                <button 
                                                    onClick={() => {
                                                        if (order.paymentId) {
                                                            navigator.clipboard.writeText(order.paymentId);
                                                            alert('ID copied to clipboard');
                                                        }
                                                    }}
                                                    className="p-1 text-slate-300 hover:text-slate-900 transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyPurchases;
