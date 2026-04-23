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
                <h2 className="text-4xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
                <p className="text-slate-400 text-sm mb-12">Add some items to get started</p>
                <Link to="/" className="inline-block bg-slate-900 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-black transition-all">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-24">
            <div className="container mx-auto px-6 py-12 max-w-7xl">
                <h1 className="text-4xl font-bold text-slate-900 mb-12">My Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Cart Items */}
                        <div className="space-y-8">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">Items</h2>
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
                                            <button onClick={() => removeFromCart(item._id)} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Shipping Address Section */}
                        <div className="space-y-8 pt-8 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Delivery Address</h2>
                                    <p className="text-xs text-slate-400 mt-1">Choose where to ship your order</p>
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
                                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative group ${
                                        selectedAddressId === addr._id 
                                        ? 'border-slate-900 bg-white shadow-lg shadow-slate-100' 
                                        : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                                    }`}
                                >
                                    <div className="flex flex-col gap-1 pr-8">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                selectedAddressId === addr._id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {addr.name}
                                            </span>
                                            {selectedAddressId === addr._id && (
                                                <span className="text-[10px] font-bold text-emerald-600">Selected</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 leading-tight">{addr.line1}</span>
                                        <span className="text-xs text-slate-500">{addr.city}, {addr.state} - {addr.zipCode}</span>
                                        
                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                                            <span className="text-xs font-medium text-slate-400">Phone: <span className="text-slate-900 font-bold">{addr.phone}</span></span>
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
                                    <div className="col-span-full py-16 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center">
                                        <p className="text-sm font-medium text-slate-400 mb-6">No addresses added yet</p>
                                        <button 
                                            onClick={() => setIsAddressModalOpen(true)}
                                            className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                                        >Add Address</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                <div className="lg:col-span-1">
                    <div className="bg-slate-50 p-8 rounded-2xl sticky top-24">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900">Summary</h3>
                        </div>
                        
                        <div className="space-y-6 mb-10">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Subtotal</span>
                                <span className="text-sm font-bold text-slate-900">₹{getCartTotal().toLocaleString()}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Shipping</span>
                                <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest text-[10px]">Free</span>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-200 my-6"></div>
                            
                            <div className="pt-2">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-lg font-bold text-slate-900">Total</span>
                                    <span className="text-3xl font-bold text-slate-900">
                                        ₹{getCartTotal().toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-xs font-medium">
                                <div className="flex items-center gap-2 mb-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                                    <span>Error</span>
                                </div>
                                {error}
                            </div>
                        )}

                        <button 
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full"
                        >
                            <div className={`w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-3 ${loading ? 'opacity-50' : ''}`}>
                                {loading ? 'Processing...' : 'Checkout Now'}
                                {!loading && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                )}
                            </div>
                        </button>
                        
                        <div className="mt-8 pt-8 border-t border-slate-200 space-y-2">
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Secure checkout powered by Razorpay.
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
