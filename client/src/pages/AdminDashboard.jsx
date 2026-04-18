import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState({
        users: [],
        orders: [],
        withdrawals: [],
        products: []
    });
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', profit: '', description: '', imageUrl: '' });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, ordersRes, withdrawalsRes, productsRes] = await Promise.all([
                axios.get('/admin/users'),
                axios.get('/admin/orders'),
                axios.get('/admin/withdrawals'),
                axios.get('/shop/products') // Using existing shop route for products list
            ]);
            setData({
                users: usersRes.data,
                orders: ordersRes.data,
                withdrawals: withdrawalsRes.data,
                products: productsRes.data
            });
        } catch (err) {
            console.error('Error fetching admin data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (userId, purchaseId, status) => {
        try {
            await axios.get(`/admin/orders/${userId}/${purchaseId}?status=${status}`);
            fetchData();
        } catch (err) {
            console.error('Error updating order status', err);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/admin/products', newProduct);
            setNewProduct({ name: '', price: '', profit: '', description: '', imageUrl: '' });
            fetchData();
        } catch (err) {
            console.error('Error adding product', err);
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/admin/products/${editingProduct._id}`, editingProduct);
            setEditingProduct(null);
            fetchData();
        } catch (err) {
            console.error('Error updating product', err);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`/admin/products/${id}`);
            fetchData();
        } catch (err) {
            console.error('Error deleting product', err);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Admin Command Center</h1>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 p-2 rounded-2xl w-fit">
                {['users', 'orders', 'withdrawals', 'products'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${
                            activeTab === tab ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto"></div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-500 tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Earnings</th>
                                        <th className="px-6 py-4">Withdrawn</th>
                                        <th className="px-6 py-4">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.users.map(u => (
                                        <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold">{u.username}</td>
                                            <td className="px-6 py-4 text-gray-600">{u.email}</td>
                                            <td className="px-6 py-4 text-green-600 font-bold">₹{u.earnings?.total || 0}</td>
                                            <td className="px-6 py-4 text-red-600 font-bold">₹{u.earnings?.withdrawn || 0}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${u.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-500 tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.orders.map(o => (
                                        <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold">{o.user.username}</div>
                                                <div className="text-[10px] text-gray-400">{o.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 uppercase text-xs font-bold">{o.productName}</td>
                                            <td className="px-6 py-4 font-black">₹{o.price}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                                                    o.status === 'Shipping Done' ? 'bg-green-100 text-green-700' :
                                                    o.status === 'Shipping Started' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <button 
                                                    onClick={() => handleUpdateOrderStatus(o.user.id, o._id, 'Shipping Started')}
                                                    className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                                                    title="Start Shipping"
                                                >
                                                    🚚
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateOrderStatus(o.user.id, o._id, 'Shipping Done')}
                                                    className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                                                    title="Mark Done"
                                                >
                                                    ✅
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'withdrawals' && (
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-500 tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Brand</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Code</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.withdrawals.map((w, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold">{w.user.username}</td>
                                            <td className="px-6 py-4 uppercase text-xs font-bold">{w.brand}</td>
                                            <td className="px-6 py-4 font-black text-red-600">₹{w.amount}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{w.couponCode}</td>
                                            <td className="px-6 py-4 text-xs text-gray-400">{new Date(w.date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Product Form */}
                                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-2xl">
                                    <h3 className="text-xl font-bold uppercase italic tracking-tighter mb-4">
                                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                                    </h3>
                                    <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4 text-sm">
                                        <input 
                                            placeholder="Name" 
                                            className="w-full p-3 rounded-xl border border-gray-200"
                                            value={editingProduct ? editingProduct.name : newProduct.name}
                                            onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})}
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input 
                                                placeholder="Price (₹)" 
                                                type="number"
                                                className="w-full p-3 rounded-xl border border-gray-200"
                                                value={editingProduct ? editingProduct.price : newProduct.price}
                                                onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})}
                                                required
                                            />
                                            <input 
                                                placeholder="Profit (₹)" 
                                                type="number"
                                                className="w-full p-3 rounded-xl border border-gray-200"
                                                value={editingProduct ? editingProduct.profit : newProduct.profit}
                                                onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, profit: e.target.value}) : setNewProduct({...newProduct, profit: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <textarea 
                                            placeholder="Description" 
                                            className="w-full p-3 rounded-xl border border-gray-200"
                                            value={editingProduct ? editingProduct.description : newProduct.description}
                                            onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})}
                                        />
                                        <input 
                                            placeholder="Image URL" 
                                            className="w-full p-3 rounded-xl border border-gray-200"
                                            value={editingProduct ? editingProduct.imageUrl : newProduct.imageUrl}
                                            onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, imageUrl: e.target.value}) : setNewProduct({...newProduct, imageUrl: e.target.value})}
                                        />
                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" className="flex-1 bg-black text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs">
                                                {editingProduct ? 'Update' : 'Save Product'}
                                            </button>
                                            {editingProduct && (
                                                <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-3 rounded-xl bg-gray-200 font-bold uppercase text-xs">
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>

                                {/* Products List */}
                                <div className="lg:col-span-2 space-y-4">
                                    {data.products.map(p => (
                                        <div key={p._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                                            <img src={p.imageUrl} alt={p.name} className="w-20 h-20 object-cover rounded-xl" />
                                            <div className="flex-1">
                                                <h4 className="font-bold uppercase text-sm">{p.name}</h4>
                                                <p className="text-xs text-gray-500 truncate max-w-xs">{p.description}</p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="font-black text-sm">₹{p.price}</span>
                                                    <span className="text-xs text-green-600 font-bold uppercase">Profit: ₹{p.profit}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => setEditingProduct(p)} className="text-xs font-bold uppercase tracking-widest hover:underline">Edit</button>
                                                <button onClick={() => handleDeleteProduct(p._id)} className="text-xs font-bold uppercase tracking-widest text-red-500 hover:underline">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
