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
                name: "Referal System",
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
        <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-8 uppercase tracking-wide">Accessories Collection</h1>
            {message && <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.map(product => (
                    <div key={product._id} className="card flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
                        {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover mb-4 rounded-md" />}
                        <div>
                            <h3 className="text-xl font-semibold">{product.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                            <p className="text-2xl font-bold mt-4">₹{product.price}</p>
                        </div>
                        <button
                            onClick={() => handlePurchase(product)}
                            className="btn btn-primary mt-6 w-full"
                        >
                            Purchase Now
                        </button>
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
