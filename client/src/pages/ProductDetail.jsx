import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SuccessModal from '../components/SuccessModal';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const { addToCart, cartItems } = useCart();
    
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRelated, setLoadingRelated] = useState(true);
    const [error, setError] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [addressForm, setAddressForm] = useState({
        line1: '',
        city: '',
        state: 'Maharashtra',
        zipCode: '',
        phone: ''
    });
    const [pendingPurchaseType, setPendingPurchaseType] = useState(null); // 'online' or 'wallet'

    const INDIAN_STATES = [
        "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
        "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
        "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
        "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", 
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", 
        "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/shop/products/${id}`);
                setProduct(res.data);
                
                // Once product is loaded, fetch related products separately
                fetchRelated(res.data);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Product not found.');
            } finally {
                setLoading(false);
            }
        };

        const fetchRelated = async (currentProduct) => {
            try {
                setLoadingRelated(true);
                const res = await axios.get('/shop/products');
                // Filter related products (same category, excluding current)
                const related = res.data.filter(p => 
                    p._id !== currentProduct._id && 
                    p.category?._id === currentProduct.category?._id
                ).slice(0, 3);
                setRelatedProducts(related);
            } catch (err) {
                console.error('Error fetching related products:', err);
            } finally {
                setLoadingRelated(false);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (user) {
            setAddressForm({
                line1: user.address?.line1 || '',
                city: user.address?.city || '',
                state: user.address?.state || 'Maharashtra',
                zipCode: user.address?.zipCode || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handlePurchaseInitiate = (type) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setPendingPurchaseType(type);
        setIsAddressModalOpen(true);
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            // Update profile first
            await axios.put('/auth/profile', {
                phone: addressForm.phone,
                address: {
                    line1: addressForm.line1,
                    city: addressForm.city,
                    state: addressForm.state,
                    zipCode: addressForm.zipCode
                }
            });
            await refreshUser();
            setIsAddressModalOpen(false);
            
            // Proceed with the pending purchase
            if (pendingPurchaseType === 'online') {
                executeOnlinePurchase();
            } else if (pendingPurchaseType === 'wallet') {
                executeWalletPurchase();
            }
        } catch (err) {
            console.error('Error updating address', err);
            setError('Failed to update delivery information.');
        }
    };

    const executeOnlinePurchase = async () => {
        setError('');
        try {
            const orderRes = await axios.post('/payment/create-order', {
                productId: product._id
            });

            const order = orderRes.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Games Store",
                description: `Purchase ${product.name}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            productId: product._id
                        });

                        if (verifyRes.data.success) {
                            setIsSuccessModalOpen(true);
                            refreshUser();
                        } else {
                            setError('Payment verification failed.');
                        }
                    } catch (err) {
                        console.error(err);
                        setError('Error verifying payment.');
                    }
                },
                prefill: {
                    name: user?.email || "",
                    email: user?.email || "",
                    contact: addressForm.phone || user?.phone || ""
                },
                theme: {
                    color: "#0f172a"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setError(`Payment failed: ${response.error.description}`);
            });
            rzp.open();

        } catch (err) {
            setError('Error initializing payment.');
            console.error(err);
        }
    };

    const executeWalletPurchase = async () => {
        if (!window.confirm(`Are you sure you want to purchase this game using your referral balance of ₹${product.price}?`)) {
            return;
        }

        setError('');
        try {
            const res = await axios.post('/payment/pay-with-wallet', {
                productId: product._id
            });

            if (res.data.success) {
                setIsSuccessModalOpen(true);
                refreshUser();
            } else {
                setError(res.data.msg || 'Purchase failed.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Error processing wallet purchase.');
        }
    };

    const HeroSkeleton = () => (
        <div className="container mx-auto px-6 py-12 max-w-7xl animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="aspect-square bg-slate-100 rounded-2xl"></div>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="h-6 bg-slate-100 rounded w-1/4"></div>
                        <div className="h-12 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-50 rounded w-full"></div>
                    </div>
                    <div className="h-48 bg-slate-100 rounded-2xl"></div>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="bg-white min-h-screen">
            <div className="border-b border-slate-50">
                <div className="container mx-auto px-6 py-4 max-w-7xl">
                    <div className="h-3 bg-slate-100 rounded w-24"></div>
                </div>
            </div>
            <HeroSkeleton />
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">{error || 'Product not found'}</h2>
            <Link to="/" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold transition-all hover:bg-slate-800">Back to Marketplace</Link>
        </div>
    );

    const savingsPercent = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : null;

    return (
        <div className="bg-white min-h-screen">
            {/* Header / Breadcrumb Wrap */}
            <div className="border-b border-slate-100">
                <div className="container mx-auto px-6 py-4 max-w-7xl">
                    <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <Link to="/" className="hover:text-slate-900 transition-colors">Store</Link>
                        <span className="text-slate-200">/</span>
                        <span className="text-slate-900 uppercase tracking-widest">{product.category?.name || "Game"}</span>
                    </nav>
                </div>
            </div>

            {/* Main Product Hero */}
            <div className="container mx-auto px-6 py-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    
                    {/* Left: Product Visuals */}
                    <div className="space-y-8">
                        <div className="relative aspect-square bg-slate-50 rounded-2xl flex items-center justify-center p-6 md:p-10 overflow-hidden border border-slate-100">
                            {product.imageUrl ? (
                                <img 
                                    src={product.imageUrl} 
                                    alt={product.name} 
                                    className="max-w-full max-h-full object-contain" 
                                />
                            ) : (
                                <div className="text-slate-200">
                                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                </div>
                            )}
                            
                            {savingsPercent && (
                                <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg">
                                    SAVE {savingsPercent}%
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Purchase Sidebar */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-md">
                                    {product.category?.name || "Game"}
                                </span>
                                {product.stock <= 5 && product.stock > 0 && (
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                                        Limited Stock
                                    </span>
                                )}
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                                {product.name}
                            </h1>
                            
                            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md">
                                {product.description || "Get your hands on this premium game. We provide fast and reliable delivery directly to your doorstep. Order now to start your adventure!"}
                            </p>
                        </div>

                        <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Pricing & Checkout</span>
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-4xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
                                {product.originalPrice && (
                                    <span className="text-md text-slate-300 line-through font-bold">₹{product.originalPrice.toLocaleString()}</span>
                                )}
                            </div>

                            <div className="flex gap-3 mb-4 w-full">
                                <button
                                    onClick={() => {
                                        const isInCart = cartItems.some(item => item._id === product._id);
                                        if (isInCart) {
                                            navigate('/cart');
                                        } else {
                                            addToCart(product);
                                        }
                                    }}
                                    disabled={product.stock <= 0}
                                    className={`flex-1 py-4 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${
                                        product.stock <= 0 
                                        ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100' 
                                        : cartItems.some(item => item._id === product._id)
                                            ? 'bg-white border border-slate-900 text-slate-900 hover:bg-slate-50'
                                            : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-100'
                                    }`}
                                >
                                    {product.stock <= 0 ? 'Out of Stock' : cartItems.some(item => item._id === product._id) ? 'Go to Cart' : 'Add to Cart'}
                                </button>
                            </div>

                            {user && (user.earnings.total - (user.earnings.withdrawn || 0)) >= product.price && (
                                <button
                                    onClick={() => handlePurchaseInitiate('wallet')}
                                    disabled={product.stock <= 0}
                                    className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                                >
                                    Pay with Balance (₹{product.price})
                                </button>
                            )}
                        </div>


                    </div>
                </div>
            </div>

            {/* In-depth Details & Guide */}
            <div className="bg-slate-50 py-24 mt-20">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                        <div className="space-y-12">
                            <div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Delivery info</h3>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">Fast and reliable shipping to your home.</h2>
                            </div>
                            
                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Order Confirmed", desc: "Your order is placed and payment is verified." },
                                    { step: "02", title: "Processing", desc: "Our team prepares your package for shipment." },
                                    { step: "03", title: "Delivered", desc: "Receive your product at your doorstep within 3-5 business days." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-6 pb-8 border-b border-slate-200 last:border-0">
                                        <span className="text-2xl font-black text-slate-200 italic">{item.step}</span>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Shipping Terms</h3>
                            <ul className="space-y-5">
                                {[
                                    "Delivery usually takes 3-7 business days depending on location.",
                                    "Ensure your address and phone number are correct for smooth delivery.",
                                    "You can track your order status in the 'My Purchases' section.",
                                    "Contact support for any delivery-related queries.",
                                    "Return policy applies for damaged products on arrival."
                                ].map((term, idx) => (
                                    <li key={idx} className="flex gap-3 items-start group">
                                        <div className="mt-1.5 w-1 h-1 rounded-full bg-slate-900 shrink-0"></div>
                                        <span className="text-xs text-slate-600 font-bold leading-relaxed group-hover:text-slate-900 transition-colors">
                                            {term}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {(loadingRelated || relatedProducts.length > 0) && (
                <div className="container mx-auto px-6 py-24 max-w-7xl">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Recommended</h3>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Games you might like</h2>
                        </div>
                        <Link to="/" className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-1">Shop All</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {loadingRelated ? (
                            <>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 animate-pulse">
                                        <div className="aspect-[16/10] bg-slate-50 rounded-2xl mb-6"></div>
                                        <div className="space-y-4">
                                            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                            <div className="flex justify-between items-center pt-2">
                                                <div className="h-6 bg-slate-100 rounded w-1/4"></div>
                                                <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            relatedProducts.map(p => (
                                <Link 
                                    key={p._id} 
                                    to={`/${p.slug || p._id}`} 
                                    className="group block bg-white border border-slate-100 rounded-xl p-5 hover:shadow-xl hover:shadow-slate-50 transition-all duration-500"
                                >
                                    <div className="aspect-[16/10] bg-slate-50 rounded-lg mb-5 flex items-center justify-center p-5 overflow-hidden">
                                        <img 
                                            src={p.imageUrl} 
                                            alt={p.name} 
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-sm font-black text-slate-900 leading-tight group-hover:text-slate-600 transition-colors">{p.name}</h4>
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-xl font-black text-slate-900">₹{p.price.toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buy Details</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}

            <SuccessModal 
                isOpen={isSuccessModalOpen} 
                onClose={() => setIsSuccessModalOpen(false)} 
                productName={product.name} 
            />

            {/* Address Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Delivery Address</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Confirm where to ship your game</p>
                            </div>
                            <button onClick={() => setIsAddressModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddressSubmit} className="p-10 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Flat, House no., Building, Company, Apartment</label>
                                <input 
                                    type="text"
                                    required
                                    value={addressForm.line1}
                                    onChange={(e) => setAddressForm({...addressForm, line1: e.target.value})}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-900 transition-all"
                                    placeholder="e.g. 402, Sunshine Residency"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Town/City</label>
                                    <input 
                                        type="text"
                                        required
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-900 transition-all"
                                        placeholder="Mumbai"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                                    <select 
                                        required
                                        value={addressForm.state}
                                        onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-900 transition-all appearance-none cursor-pointer"
                                    >
                                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                                    <input 
                                        type="text"
                                        required
                                        pattern="[0-9]{6}"
                                        maxLength="6"
                                        value={addressForm.zipCode}
                                        onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-900 transition-all"
                                        placeholder="400001"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                                    <input 
                                        type="tel"
                                        required
                                        pattern="[0-9]{10}"
                                        maxLength="10"
                                        value={addressForm.phone}
                                        onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-900 transition-all"
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddressModalOpen(false)}
                                    className="flex-1 px-8 py-4 border border-slate-200 text-slate-400 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:border-slate-900 hover:text-slate-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                                >
                                    Confirm & Pay
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
