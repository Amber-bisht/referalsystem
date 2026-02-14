import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState('');
    const { refreshUser } = useAuth();

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
            const res = await axios.post('/shop/purchase', {
                productId: product._id
            });
            setMessage(res.data.msg);
            refreshUser(); // Update stats if anything changed
        } catch (err) {
            setMessage('Purchase failed');
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-8 uppercase tracking-wide">Accessories Collection</h1>
            {message && <div className="p-4 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-md">{message}</div>}

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
        </div>
    );
};

export default Dashboard;
