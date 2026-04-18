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
                    name: user?.username || "",
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
            <h1 className="text-3xl font-bold mb-10 text-slate-900">Accessories Collection</h1>
            {message && <div className="p-4 mb-6 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-sm">{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {products.map(product => (
                    <div key={product._id} className="group border border-slate-100 rounded-2xl overflow-hidden hover:border-slate-300 transition-all">
                        {product.imageUrl && (
                            <div className="overflow-hidden">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                        )}
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                            <p className="text-slate-500 text-sm mt-2 line-clamp-2 h-10">{product.description}</p>
                            <div className="flex items-center justify-between mt-8">
                                <span className="text-2xl font-bold text-slate-900">₹{product.price}</span>
                                <button
                                    onClick={() => handlePurchase(product)}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold active:scale-95 transition-all shadow-sm"
                                >
                                    Purchase
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
