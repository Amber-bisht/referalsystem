import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Address Management State
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAddress, setCurrentAddress] = useState({
        name: '',
        line1: '',
        city: '',
        state: 'Maharashtra',
        zipCode: '',
        phone: ''
    });

    const INDIAN_STATES = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
        "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
        "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ];

    useEffect(() => {
        if (user) {
            setAddresses(user.addresses || []);
            // Set default address if available
            const defaultAddr = user.addresses?.find(a => a.isDefault);
            if (defaultAddr) setSelectedAddressId(defaultAddr._id);
            else if (user.addresses?.length > 0) setSelectedAddressId(user.addresses[0]._id);
        }
    }, [user]);

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing) {
                await axios.put(`/user/address/${currentAddress._id}`, currentAddress);
            } else {
                await axios.post('/user/address', currentAddress);
            }
            await refreshUser();
            setIsAddressModalOpen(false);
            resetAddressForm();
        } catch (err) {
            setError('Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            await axios.delete(`/user/address/${id}`);
            await refreshUser();
        } catch (err) {
            setError('Failed to delete address');
        }
    };

    const resetAddressForm = () => {
        setCurrentAddress({ name: '', line1: '', city: '', state: 'Maharashtra', zipCode: '', phone: '' });
        setIsEditing(false);
    };

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) return;
        if (!selectedAddressId) {
            setError('Please select or add a shipping address to proceed.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Create order on backend
            const res = await axios.post('/payment/create-cart-order', {
                items: cartItems.map(item => ({
                    productId: item._id,
                    quantity: item.quantity
                })),
                addressId: selectedAddressId
            });

            const { amount, currency, id: rzpOrderId } = res.data;

            // 2. Initialize Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount,
                currency,
                name: "REFERALSYSTEM",
                description: `Bulk purchase of ${cartItems.length} items`,
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
                            })),
                            addressId: selectedAddressId
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
                    contact: addresses.find(a => a._id === selectedAddressId)?.phone || ""
                },
                theme: { color: "#0f172a" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setError(err.response?.data?.msg || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-6 py-24 text-center">
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">Your bag is empty</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-12">System waiting for input</p>
                <Link to="/" className="inline-block bg-slate-900 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-24">
            <div className="container mx-auto px-6 py-12 max-w-7xl">
                <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-12">Shopping Bag</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Cart Items */}
                        <div className="space-y-8">
                            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Manifested Items</h2>
                            {cartItems.map((item) => (
                                <div key={item._id} className="flex gap-8 group pb-8 border-b border-slate-50 last:border-0">
                                    <div className="w-32 h-32 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center p-4 border border-slate-100">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{item.name}</h3>
                                            <p className="text-xl font-black text-slate-900">₹{item.price.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-4">
                                            <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="text-slate-400 hover:text-slate-900 font-black">-</button>
                                                <span className="text-sm font-black text-slate-900 w-8 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="text-slate-400 hover:text-slate-900 font-black">+</button>
                                            </div>
                                            <button onClick={() => removeFromCart(item._id)} className="text-[10px] font-black text-red-300 hover:text-red-500 uppercase tracking-widest transition-colors">Terminate Item</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Shipping Address Section */}
                        <div className="space-y-8 pt-8 border-t-2 border-slate-900">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Shipping Protocol</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select delivery destination</p>
                                </div>
                                <button 
                                    onClick={() => { resetAddressForm(); setIsAddressModalOpen(true); }}
                                    className="text-[10px] font-black text-slate-900 bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 uppercase tracking-widest transition-all"
                                >+ Add New Address</button>
                            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {addresses.map((addr) => (
                                <div 
                                    key={addr._id}
                                    onClick={() => setSelectedAddressId(addr._id)}
                                    className={`p-6 border-2 transition-all cursor-pointer relative group ${
                                        selectedAddressId === addr._id 
                                        ? 'border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]' 
                                        : 'border-slate-100 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex flex-col gap-1 pr-8">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[8px] font-black px-2 py-0.5 uppercase tracking-widest ${
                                                selectedAddressId === addr._id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {addr.name}
                                            </span>
                                            {selectedAddressId === addr._id && (
                                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Priority Destination</span>
                                            )}
                                        </div>
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight leading-tight">{addr.line1}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{addr.city}, {addr.state} - {addr.zipCode}</span>
                                        
                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-dashed border-slate-100">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-slate-900"></div>
                                                <span className="text-[9px] font-black text-slate-900 tracking-wider">TEL: {addr.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute top-6 right-6 flex flex-col gap-3">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setCurrentAddress(addr); setIsEditing(true); setIsAddressModalOpen(true); }}
                                            className="p-1.5 hover:bg-slate-100 transition-colors"
                                        >
                                            <svg className="w-3 h-3 text-slate-400 hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                                            className="p-1.5 hover:bg-red-50 transition-colors"
                                        >
                                            <svg className="w-3 h-3 text-slate-300 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                                {addresses.length === 0 && (
                                    <div className="col-span-full py-16 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6">No shipping profiles identified</p>
                                        <button 
                                            onClick={() => setIsAddressModalOpen(true)}
                                            className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                        >Initialize First Address</button>
                                )}
                            </div>
                        </div>
                    </div>

                <div className="lg:col-span-1">
                    <div className="bg-white border-2 border-slate-900 p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] sticky top-24">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-100">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">Order Manifest</h3>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Secure</span>
                            </div>
                        </div>
                        
                        <div className="space-y-6 mb-10">
                            <div className="flex justify-between items-center group">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Bag Subtotal</span>
                                <span className="font-mono text-sm font-black text-slate-900 tracking-tighter">₹{getCartTotal().toLocaleString()}</span>
                            </div>
                            
                            <div className="flex justify-between items-center group">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Logistics</span>
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-0.5">Priority Delivery</span>
                                </div>
                                <span className="font-mono text-sm font-black text-emerald-500 tracking-tighter">FREE</span>
                            </div>

                            {/* Technical Receipt Divider */}
                            <div className="border-t border-dashed border-slate-200 my-4 relative">
                                <div className="absolute -left-10 -top-1.5 w-3 h-3 bg-slate-50 rounded-full border border-slate-100"></div>
                                <div className="absolute -right-10 -top-1.5 w-3 h-3 bg-slate-50 rounded-full border border-slate-100"></div>
                            </div>
                            
                            <div className="pt-2">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Total Payable</span>
                                    <span className="font-mono text-3xl font-black text-slate-900 tracking-tighter leading-none">
                                        ₹{getCartTotal().toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Inclusive of all taxes</span>
                                    <span className="text-[8px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 uppercase tracking-widest">ENC: AES-256</span>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 rounded-none text-[10px] font-black uppercase tracking-wider leading-relaxed">
                                <div className="flex items-center gap-2 mb-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                                    <span>Transaction Error</span>
                                </div>
                                {error}
                            </div>
                        )}

                        <button 
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-slate-900 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-200"></div>
                            <div className={`relative w-full py-5 border-2 border-slate-900 bg-slate-900 text-white group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-200 flex items-center justify-center gap-3 ${loading ? 'opacity-50' : ''}`}>
                                <span className="text-[11px] font-black uppercase tracking-[0.4em]">
                                    {loading ? 'Processing...' : 'Authorize Payment'}
                                </span>
                                {!loading && (
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                )}
                            </div>
                        </button>
                        
                        <div className="mt-8 pt-8 border-t border-slate-50 space-y-2">
                            <div className="flex items-center gap-2">
                                <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">SSL Secured Transaction</p>
                            </div>
                            <p className="text-[7px] text-slate-300 font-medium uppercase tracking-[0.1em] leading-relaxed">
                                By authorizing payment, you confirm the manifest and accept all digital license agreements.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{isEditing ? 'Modify Address' : 'New Address'}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure shipping endpoint</p>
                            </div>
                            <button onClick={() => setIsAddressModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddressSubmit} className="p-10 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label</label>
                                <input required type="text" placeholder="Home, Office, etc." className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-900 transition-all" value={currentAddress.name} onChange={(e) => setCurrentAddress({...currentAddress, name: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Line 1</label>
                                <input required type="text" placeholder="Street, Building, etc." className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-900 transition-all" value={currentAddress.line1} onChange={(e) => setCurrentAddress({...currentAddress, line1: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                    <input required type="text" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-900 transition-all" value={currentAddress.city} onChange={(e) => setCurrentAddress({...currentAddress, city: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                                    <select required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-900 transition-all appearance-none cursor-pointer" value={currentAddress.state} onChange={(e) => setCurrentAddress({...currentAddress, state: e.target.value})} >
                                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zip</label>
                                    <input required type="text" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-900 transition-all" value={currentAddress.zipCode} onChange={(e) => setCurrentAddress({...currentAddress, zipCode: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                                    <input required type="tel" placeholder="+91" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-900 transition-all" value={currentAddress.phone} onChange={(e) => setCurrentAddress({...currentAddress, phone: e.target.value})} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="flex-1 px-8 py-4 border border-slate-200 text-slate-400 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:border-slate-900 hover:text-slate-900 transition-all">Abort</button>
                                <button type="submit" disabled={loading} className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">{loading ? 'Saving...' : 'Authorize'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default Cart;
