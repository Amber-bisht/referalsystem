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
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
                axios.get('/shop/products')
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

    const menuItems = [
        { id: 'users', label: 'Users', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
        { id: 'orders', label: 'Orders', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg> },
        { id: 'withdrawals', label: 'Withdrawals', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> },
        { id: 'products', label: 'Products', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg> },
    ];

    return (
        <div className="flex h-screen bg-white overflow-hidden text-slate-900 font-sans">
            {/* Minimalist Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-50 border-r border-slate-100 transition-all duration-300 flex flex-col`}>
                <div className="p-6 flex items-center justify-between">
                    {sidebarOpen && <h1 className="text-lg font-bold tracking-tight">referal.amberbisht.me</h1>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-200 rounded text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                                activeTab === item.id ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            {item.icon}
                            {sidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-red-600 transition-all text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Content area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-100 p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold">A</div>
                        <span className="text-sm font-medium hidden sm:block">Super Admin</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto">
                            {/* Summary row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Users', val: data.users.length },
                                    { label: 'Orders', val: data.orders.length },
                                    { label: 'Redemptions', val: data.withdrawals.length },
                                    { label: 'Products', val: data.products.length }
                                ].map((stat, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">{stat.label}</p>
                                        <p className="text-xl font-bold">{stat.val}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                {activeTab === 'users' && (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-6 py-3 font-semibold">User</th>
                                                <th className="px-6 py-3 font-semibold">Financials</th>
                                                <th className="px-6 py-3 font-semibold">Referral</th>
                                                <th className="px-6 py-3 font-semibold text-center">Role</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.users.map(u => (
                                                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold">{u.username}</div>
                                                        <div className="text-xs text-slate-400">{u.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-green-600 font-medium">₹{u.earnings?.total || 0} Total</div>
                                                        <div className="text-slate-400 text-xs">₹{u.earnings?.withdrawn || 0} Withdrawn</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-medium">{u.referralCode}</div>
                                                        <div className="text-[10px] text-slate-400 uppercase">{u.directReferrals?.length || 0} Network</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-800'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {activeTab === 'orders' && (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-6 py-3 font-semibold">Order</th>
                                                <th className="px-6 py-3 font-semibold">Customer</th>
                                                <th className="px-6 py-3 font-semibold">Product</th>
                                                <th className="px-6 py-3 font-semibold">Status</th>
                                                <th className="px-6 py-3 font-semibold text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.orders.map(o => (
                                                <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">{o.razorpayOrderId?.slice(-8)}</td>
                                                    <td className="px-6 py-4 font-medium">{o.user.username}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-600">₹{o.price} <span className="text-xs font-normal ml-1">({o.productName})</span></td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider ${
                                                            o.status === 'Shipping Done' ? 'bg-emerald-600 text-white' : 
                                                            o.status === 'Shipping Started' ? 'bg-blue-600 text-white' :
                                                            'bg-slate-800 text-white'
                                                        }`}>
                                                            {o.status || 'PAID'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center space-x-2">
                                                        <button onClick={() => handleUpdateOrderStatus(o.user.id, o._id, 'Shipping Started')} className="p-1 hover:bg-slate-100 rounded text-blue-500" title="Ship"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></button>
                                                        <button onClick={() => handleUpdateOrderStatus(o.user.id, o._id, 'Shipping Done')} className="p-1 hover:bg-slate-100 rounded text-green-500" title="Done"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {activeTab === 'withdrawals' && (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-6 py-3 font-semibold">Brand</th>
                                                <th className="px-6 py-3 font-semibold">User</th>
                                                <th className="px-6 py-3 font-semibold">Value</th>
                                                <th className="px-6 py-3 font-semibold">Code</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.withdrawals.map((w, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-bold">{w.brand}</td>
                                                    <td className="px-6 py-4">{w.user.username}</td>
                                                    <td className="px-6 py-4 font-extrabold text-red-500">₹{w.amount}</td>
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-400 bg-slate-50 underline">{w.couponCode}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {activeTab === 'products' && (
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                                                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">{editingProduct ? 'Edit SKU' : 'Add New'}</h3>
                                                <input placeholder="Name" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900" value={editingProduct ? editingProduct.name : newProduct.name} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} required />
                                                <div className="flex gap-2">
                                                    <input type="number" placeholder="Price" className="w-1/2 px-3 py-2 text-sm border border-slate-200 rounded-lg" value={editingProduct ? editingProduct.price : newProduct.price} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} required />
                                                    <input type="number" placeholder="Profit" className="w-1/2 px-3 py-2 text-sm border border-slate-200 rounded-lg" value={editingProduct ? editingProduct.profit : newProduct.profit} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, profit: e.target.value}) : setNewProduct({...newProduct, profit: e.target.value})} required />
                                                </div>
                                                <input placeholder="Image URL" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" value={editingProduct ? editingProduct.imageUrl : newProduct.imageUrl} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, imageUrl: e.target.value}) : setNewProduct({...newProduct, imageUrl: e.target.value})} />
                                                <textarea placeholder="Description" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg h-24" value={editingProduct ? editingProduct.description : newProduct.description} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} />
                                                <div className="flex gap-2">
                                                    <button type="submit" className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-bold">{editingProduct ? 'Update' : 'Save'}</button>
                                                    {editingProduct && <button type="button" onClick={() => setEditingProduct(null)} className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold">Cancel</button>}
                                                </div>
                                            </form>
                                            <div className="lg:col-span-2 space-y-3">
                                                {data.products.map(p => (
                                                    <div key={p._id} className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                                        <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                                                        <div className="flex-1">
                                                            <div className="text-sm font-bold truncate max-w-[200px]">{p.name}</div>
                                                            <div className="text-xs text-slate-400">₹{p.price} • ₹{p.profit} Profit</div>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button onClick={() => setEditingProduct(p)} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase">Edit</button>
                                                            <button onClick={() => handleDeleteProduct(p._id)} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase">Delete</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
