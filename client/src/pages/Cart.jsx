import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) return;

        setLoading(true);
        setError('');

        try {
            // Check if user has address
            if (!user.address || !user.address.line1) {
                // Redirect to profile or show a message?
                // Actually, the ProductDetail has an AddressModal. 
                // For simplicity here, we assume user should have address.
                // Or we can just use a simple prompt for now.
                setError('Please update your shipping address in Profile before checkout.');
                setLoading(false);
                return;
            }

            // Create multiple orders or a single multi-item order?
            // Current backend expects one order per product.
            // We will create orders one by one or add a new cart-checkout route.
            
            // Let's create a cart-order session on backend
            const res = await axios.post('/payment/create-cart-order', {
                items: cartItems.map(item => ({
                    productId: item._id,
                    quantity: item.quantity
                }))
            });

            const { order, amount, currency, id: rzpOrderId } = res.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: amount,
                currency: currency,
                name: "referalsystem",
                description: `Payment for ${cartItems.length} items`,
                order_id: rzpOrderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post('/payment/verify-cart', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            items: cartItems.map(item => ({
                                productId: item._id,
                                quantity: item.quantity
                            }))
                        });

                        if (verifyRes.data.success) {
                            clearCart();
                            navigate('/my-purchases');
                        } else {
                            setError('Payment verification failed.');
                        }
                    } catch (err) {
                        console.error(err);
                        setError('Error verifying payment.');
                    }
                },
                prefill: {
                    name: user.email,
                    email: user.email,
                    contact: user.phone || ""
                },
                theme: {
                    color: "#0f172a"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-6 py-32 max-w-2xl text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-slate-100">
                    <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Your cart is empty</h2>
                <p className="text-slate-400 mb-10 text-xs font-bold uppercase tracking-widest">Add some games to your collection to get started.</p>
                <Link to="/" className="px-10 py-4 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95">Browse Marketplace</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <header className="mb-12 border-b border-slate-100 pb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Shopping Cart</h1>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{cartItems.length} items in your bag</p>
            </header>

            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <div key={item._id} className="flex gap-6 p-4 bg-white border border-slate-100 rounded-xl group hover:border-slate-300 transition-all">
                            <div className="w-24 h-24 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 p-2">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">{item.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">₹{item.price.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center border border-slate-100 rounded-lg overflow-hidden">
                                        <button 
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                                        >-</button>
                                        <span className="px-4 py-1 text-xs font-black text-slate-900">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                                        >+</button>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item._id)}
                                        className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                                    >Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-slate-900 text-white p-8 rounded-xl shadow-2xl shadow-slate-200">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Order Summary</h3>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
                                <span className="font-black tracking-tight">₹{getCartTotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-widest">Delivery</span>
                                <span className="font-black text-emerald-400 uppercase tracking-widest">FREE</span>
                            </div>
                            <div className="h-px bg-slate-800 my-4"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black uppercase tracking-widest">Total</span>
                                <span className="text-xl font-black tracking-tighter">₹{getCartTotal().toLocaleString()}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full py-4 bg-white text-slate-900 rounded-lg text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Secure Checkout'}
                        </button>
                        
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-6 text-center">
                            By proceeding, you agree to our terms of service.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
