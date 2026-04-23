import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SuccessModal from '../components/SuccessModal';
import HeroBanner from '../components/HeroBanner';

const Dashboard = () => {
    const [banners, setBanners] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingBanners, setLoadingBanners] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [message, setMessage] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [purchasedProduct, setPurchasedProduct] = useState(null);
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await axios.get('/shop/banners');
                setBanners(res.data);
            } catch (err) {
                console.error('Error fetching banners:', err);
            } finally {
                setLoadingBanners(false);
            }
        };

        const fetchProducts = async () => {
            try {
                const res = await axios.get('/shop/products');
                setProducts(res.data);
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoadingProducts(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const res = await axios.get('/shop/categories');
                setCategories(res.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchBanners();
        fetchProducts();
        fetchCategories();
    }, []);

    const handlePurchase = async (e, product) => {
        e.preventDefault(); // Prevent navigating to detail page when buying
        if (!user) {
            navigate('/login');
            return;
        }
        setMessage('');
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
                            setPurchasedProduct(product);
                            setIsSuccessModalOpen(true);
                            refreshUser();
                        } else {
                            setMessage('Payment verification failed.');
                        }
                    } catch (err) {
                        console.error(err);
                        setMessage('Error verifying payment.');
                    }
                },
                prefill: {
                    name: user?.email || "",
                    email: user?.email || "",
                    contact: user?.phone || ""
                },
                theme: {
                    color: "#0f172a"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setMessage(`Payment failed: ${response.error.description}`);
            });
            rzp.open();

        } catch (err) {
            setMessage('Error initializing payment.');
            console.error(err);
        }
    };

    const ProductSkeleton = () => (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col animate-pulse">
            <div className="aspect-[16/10] bg-slate-100"></div>
            <div className="p-6 space-y-4">
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-3 bg-slate-50 rounded w-full"></div>
                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="h-6 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-10 bg-slate-100 rounded w-1/3"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen">
            <HeroBanner banners={banners} isLoading={loadingBanners} />
            
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Games Store</h1>
                    <p className="text-slate-500 text-sm font-medium">Browse and purchase premium games. We deliver right to your doorstep.</p>
                </header>

                {message && (
                    <div className="p-4 mb-8 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        {message}
                    </div>
                )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loadingProducts ? (
                    <>
                        <ProductSkeleton />
                        <ProductSkeleton />
                        <ProductSkeleton />
                        <ProductSkeleton />
                        <ProductSkeleton />
                        <ProductSkeleton />
                    </>
                ) : (
                    products.map(product => (
                        <Link 
                            to={`/${product.slug || product._id}`} 
                            key={product._id} 
                            className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 border-b border-slate-50">
                                {product.imageUrl ? (
                                    <img 
                                        src={product.imageUrl} 
                                        alt={product.name} 
                                        className={`w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ${product.stock <= 0 ? 'grayscale opacity-50' : ''}`} 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    </div>
                                )}

                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2 transition-transform group-hover:translate-x-1">
                                    {product.stock <= 0 ? (
                                        <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-sm">Sold Out</span>
                                    ) : product.stock <= 5 && (
                                        <span className="px-3 py-1 bg-white border border-slate-100 text-slate-900 text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-sm">Limited Stock</span>
                                    ) }
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2 gap-2">
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight group-hover:text-slate-700 transition-colors">{product.name}</h3>
                                    <span className="flex-shrink-0 px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest rounded-md">Game</span>
                                </div>
                                
                                <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 line-clamp-2 h-8">
                                    Safe and reliable delivery to your address.
                                </p>

                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-slate-900 leading-none">₹{product.price.toLocaleString()}</span>
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400 line-through font-bold decoration-slate-300">₹{product.originalPrice.toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shadow-sm">
                                                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => handlePurchase(e, product)}
                                        disabled={product.stock <= 0}
                                        className={`px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md z-10 ${
                                            product.stock <= 0 
                                            ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed shadow-none' 
                                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                                        }`}
                                    >
                                        {product.stock <= 0 ? 'Out of Stock' : 'Buy Now'}
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Category-wise Sections */}
            {!loadingCategories && categories.map(category => {
                const categoryProducts = products.filter(p => 
                    p.category && (typeof p.category === 'object' ? p.category._id === category._id : p.category === category._id)
                );
                
                if (categoryProducts.length === 0) return null;

                return (
                    <section key={category._id} className="mt-20">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{category.name}</h2>
                            <div className="h-px flex-1 bg-slate-100"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categoryProducts.map(product => (
                                <Link 
                                    to={`/${product.slug || product._id}`} 
                                    key={product._id} 
                                    className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 border-b border-slate-50">
                                        {product.imageUrl ? (
                                            <img 
                                                src={product.imageUrl} 
                                                alt={product.name} 
                                                className={`w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ${product.stock <= 0 ? 'grayscale opacity-50' : ''}`} 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 flex flex-col gap-2 transition-transform group-hover:translate-x-1">
                                            {product.stock <= 0 ? (
                                                <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-sm">Sold Out</span>
                                            ) : product.stock <= 5 && (
                                                <span className="px-3 py-1 bg-white border border-slate-100 text-slate-900 text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-sm">Limited Stock</span>
                                            ) }
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight group-hover:text-slate-700 transition-colors">{product.name}</h3>
                                            <span className="flex-shrink-0 px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest rounded-md">Game</span>
                                        </div>
                                        <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 line-clamp-2 h-8">Safe and reliable delivery to your address.</p>
                                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-black text-slate-900 leading-none">₹{product.price.toLocaleString()}</span>
                                                    {product.originalPrice && product.originalPrice > product.price && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-slate-400 line-through font-bold decoration-slate-300">₹{product.originalPrice.toLocaleString()}</span>
                                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shadow-sm">
                                                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button onClick={(e) => handlePurchase(e, product)} disabled={product.stock <= 0} className={`px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md z-10 ${product.stock <= 0 ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'}`}>{product.stock <= 0 ? 'Empty' : 'Buy Now'}</button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>

            <SuccessModal 
                isOpen={isSuccessModalOpen} 
                onClose={() => setIsSuccessModalOpen(false)} 
                productName={purchasedProduct?.name} 
            />
        </div>
    );
};

export default Dashboard;
