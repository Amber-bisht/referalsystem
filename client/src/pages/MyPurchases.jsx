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
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Order History</h1>
                    <p className="text-slate-400 text-sm font-medium">Track and manage your game deliveries.</p>
                </div>
                <Link 
                    to="/dashboard" 
                    className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    Browse More Games
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-32 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-slate-100/50">
                        <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">No orders yet</h2>
                    <p className="text-slate-400 mb-10 max-w-sm mx-auto font-medium">Your collection is empty. Start your journey by exploring our latest titles.</p>
                    <Link to="/dashboard" className="px-12 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:border-slate-900 transition-all">Go To Shop</Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => {
                        const isExpanded = expandedOrderId === order._id;
                        return (
                            <div key={order._id} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="p-8">
                                    <div className="flex flex-col lg:flex-row gap-10">
                                        {/* Product Info */}
                                        <div className="flex flex-col md:flex-row items-center gap-8 lg:w-[35%]">
                                            <div className="w-36 h-28 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 p-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                                {order.productImage ? (
                                                    <img src={order.productImage} alt={order.productName} className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <div className="text-slate-200">
                                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter rounded border ${
                                                        order.paymentMethod === 'Wallet' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                        {order.paymentMethod}
                                                    </span>
                                                    <span className="text-[10px] text-slate-300 font-bold">•</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">₹{order.amount.toLocaleString()}</span>
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{order.productName}</h3>
                                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Delivery Tracker */}
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor(order.status)}`}></div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Tracking</span>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-100 ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            
                                            <div className="relative px-2">
                                                {/* Progress Bar Background */}
                                                <div className="absolute top-[8px] left-0 w-full h-[3px] bg-slate-50 rounded-full"></div>
                                                
                                                {/* Progress Bar Active */}
                                                <div 
                                                    className={`absolute top-[8px] left-0 h-[3px] bg-slate-900 rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_10px_rgba(15,23,42,0.1)]`}
                                                    style={{ 
                                                        width: `${(statusSteps.indexOf(order.status) / (statusSteps.length - 1)) * 100}%` 
                                                    }}
                                                ></div>

                                                {/* Status Dots */}
                                                <div className="relative flex justify-between">
                                                    {statusSteps.map((step, idx) => {
                                                        const currentIndex = statusSteps.indexOf(order.status);
                                                        const isActive = currentIndex >= idx;
                                                        const isCurrent = currentIndex === idx;
                                                        
                                                        return (
                                                            <div key={step} className="flex flex-col items-center group/step">
                                                                <div className={`w-4 h-4 rounded-full border-[3px] transition-all duration-700 z-10 ${
                                                                    isActive 
                                                                    ? 'bg-slate-900 border-white ring-[3px] ring-slate-900' 
                                                                    : 'bg-white border-slate-100'
                                                                } ${isCurrent ? 'scale-125' : ''}`}></div>
                                                                <span className={`text-[9px] font-black uppercase mt-4 tracking-tighter transition-colors duration-500 ${
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
                                        <div className="lg:w-20 flex items-center justify-center">
                                            <button 
                                                onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                                                className={`p-4 rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all duration-300 ${isExpanded ? 'bg-slate-900 text-white border-slate-900 rotate-180' : 'bg-white'}`}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Details Section */}
                                {isExpanded && (
                                    <div className="bg-slate-50/50 border-t border-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipping Address</p>
                                            <p className="text-sm text-slate-700 font-medium leading-relaxed max-w-xs">
                                                {order.shippingAddress || "Not provided"}
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Information</p>
                                            <p className="text-sm text-slate-700 font-bold">
                                                {order.phoneNumber || "Not provided"}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">Available for delivery updates</p>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Reference</p>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                                                    {order.paymentId || "PENDING"}
                                                </span>
                                                <button 
                                                    onClick={() => {
                                                        if (order.paymentId) {
                                                            navigator.clipboard.writeText(order.paymentId);
                                                            alert('ID copied to clipboard');
                                                        }
                                                    }}
                                                    className="p-1.5 text-slate-300 hover:text-slate-900 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
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
