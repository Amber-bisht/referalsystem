import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SuccessModal from '../components/SuccessModal';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productRes, allProductsRes] = await Promise.all([
                    axios.get(`/shop/products/${id}`),
                    axios.get('/shop/products')
                ]);
                
                const currentProduct = productRes.data;
                setProduct(currentProduct);
                
                // Filter related products (same category, excluding current)
                const related = allProductsRes.data.filter(p => 
                    p._id !== currentProduct._id && 
                    p.category?._id === currentProduct.category?._id
                ).slice(0, 3);
                setRelatedProducts(related);
                
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Product not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const handlePurchase = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        
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
                name: "referal.amberbisht.me",
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

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
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
            <div className="border-b border-slate-50">
                <div className="container mx-auto px-6 py-4 max-w-7xl">
                    <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                        <Link to="/" className="hover:text-slate-900 transition-colors uppercase tracking-widest">Store</Link>
                        <span className="text-slate-200">/</span>
                        <span className="text-slate-900 uppercase tracking-widest">{product.category?.name || "Gift Card"}</span>
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
                                    {product.category?.name || "Voucher"}
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
                                {product.description || "Purchase this premium e-gift card to access brand-specific credits instantly. This digital voucher can be redeemed directly on the merchant's platform."}
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

                            <button
                                onClick={handlePurchase}
                                disabled={product.stock <= 0}
                                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] mb-4 ${
                                    product.stock <= 0 
                                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100' 
                                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-100'
                                }`}
                            >
                                {product.stock <= 0 ? 'Out of Stock' : 'Confirm Purchase'}
                            </button>
                        </div>

                        {/* Quick Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-50">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                </div>
                                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Instant Delivery</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-50">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                </div>
                                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">100% Genuine</span>
                            </div>
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
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">How to use</h3>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">Follow these simple steps to redeem your credits.</h2>
                            </div>
                            
                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Complete Purchase", desc: "Purchase the voucher and the code will be instantly visible in your profile." },
                                    { step: "02", title: "Copy Code", desc: "Copy the unique alphanumeric voucher code from your 'My Purchases' section." },
                                    { step: "03", title: "Apply at Merchant", desc: "Go to the merchant's portal or app and enter the code in the 'Gift Card' section." }
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

                        <div className="p-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Redemption Terms</h3>
                            <ul className="space-y-6">
                                {[
                                    "This voucher is valid for 12 months from the date of purchase.",
                                    "Non-refundable and cannot be exchanged for cash.",
                                    "Redeemable across all official merchant platforms.",
                                    "Partial lookup may vary based on merchant terms.",
                                    "For support, contact merchant customer care with your code."
                                ].map((term, idx) => (
                                    <li key={idx} className="flex gap-4 items-start group">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0"></div>
                                        <span className="text-sm text-slate-600 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
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
            {relatedProducts.length > 0 && (
                <div className="container mx-auto px-6 py-24 max-w-7xl">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Recommended</h3>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Vouchers you might like</h2>
                        </div>
                        <Link to="/" className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-1">Shop All</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {relatedProducts.map(p => (
                            <Link 
                                key={p._id} 
                                to={`/${p.slug || p._id}`} 
                                className="group block bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500"
                            >
                                <div className="aspect-[16/10] bg-slate-50 rounded-2xl mb-6 flex items-center justify-center p-6 overflow-hidden">
                                    <img 
                                        src={p.imageUrl} 
                                        alt={p.name} 
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-slate-600 transition-colors">{p.name}</h4>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xl font-black text-slate-900">₹{p.price.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buy Details</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <SuccessModal 
                isOpen={isSuccessModalOpen} 
                onClose={() => setIsSuccessModalOpen(false)} 
                productName={product.name} 
            />
        </div>
    );
};

export default ProductDetail;
