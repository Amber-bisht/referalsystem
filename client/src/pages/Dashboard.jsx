import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SuccessModal from '../components/SuccessModal';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [purchasedProduct, setPurchasedProduct] = useState(null);
    const { user, refreshUser } = useAuth();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('/shop/products');
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProducts();
    }, []);

    const handlePurchase = async (product) => {
        setMessage('');
        try {
            // 1. Create Order on Backend
            const orderRes = await axios.post('/payment/create-order', {
                productId: product._id
            });

            const order = orderRes.data;

            // 2. Initialize Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "referal.amberbisht.me",
                description: `Purchase ${product.name}`,
                order_id: order.id,
                handler: async function (response) {
                    // 3. Verify Payment on Backend
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
                },
                theme: {
                    color: "#000000"
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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-10 text-slate-900 tracking-tight">Gift Card Minting Hub</h1>
            {message && <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {products.map(product => (
                    <div key={product._id} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-slate-300 transition-all shadow-sm">
                        {product.imageUrl && (
                            <div className="relative overflow-hidden aspect-[16/10]">
                                <img src={product.imageUrl} alt={product.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${product.stock <= 0 ? 'grayscale opacity-50' : ''}`} />
                                {product.stock <= 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <span className="px-4 py-2 bg-white text-black font-black text-xs uppercase tracking-widest">Sold Out</span>
                                    </div>
                                ) : product.stock <= 5 && (
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1 bg-red-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-full shadow-lg">Only {product.stock} Left</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                                <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-widest italic">Digital Pass</span>
                            </div>
                            <p className="text-slate-500 text-sm line-clamp-2 h-10">{product.description}</p>
                            <div className="flex items-center justify-between mt-8">
                                <div className="flex flex-col">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-slate-900 leading-none">₹{product.price}</span>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <span className="text-sm text-slate-400 line-through font-bold">₹{product.originalPrice}</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Instant Delivery</span>
                                </div>
                                <button
                                    onClick={() => handlePurchase(product)}
                                    disabled={product.stock <= 0}
                                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${
                                        product.stock <= 0 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                                >
                                    {product.stock <= 0 ? 'Out of Stock' : 'Mint Voucher'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
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
