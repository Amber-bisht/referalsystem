import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState({
        users: [],
        orders: [],
        withdrawals: [],
        products: [],
        categories: [],
        banners: []
    });
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingBanner, setEditingBanner] = useState(null);
    const [newProduct, setNewProduct] = useState({ name: '', slug: '', price: '', originalPrice: '', commissionPercentage: 10, description: '', imageUrl: '', stock: '', category: '' });
    const [newCategory, setNewCategory] = useState({ name: '' });
    const [newBanner, setNewBanner] = useState({ title: '', description: '', imageUrl: '', productSlug: '', isActive: true });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, ordersRes, withdrawalsRes, productsRes, categoriesRes, bannersRes] = await Promise.all([
                axios.get('/admin/users'),
                axios.get('/admin/orders'),
                axios.get('/admin/withdrawals'),
                axios.get('/shop/products'),
                axios.get('/admin/categories'),
                axios.get('/admin/banners')
            ]);
            setData({
                users: usersRes.data,
                orders: ordersRes.data,
                withdrawals: withdrawalsRes.data,
                products: productsRes.data,
                categories: categoriesRes.data,
                banners: bannersRes.data
            });
        } catch (err) {
            console.error('Error fetching admin data', err);
        } finally {
            setLoading(false);
        }
    };


    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/admin/products', newProduct);
            setNewProduct({ name: '', slug: '', price: '', originalPrice: '', commissionPercentage: 10, description: '', imageUrl: '', stock: '', category: '' });
            fetchData();
        } catch (err) {
            console.error('Error adding product', err);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/admin/categories', newCategory);
            setNewCategory({ name: '' });
            fetchData();
        } catch (err) {
            console.error('Error adding category', err);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure? Products in this category might lose their link.')) return;
        try {
            await axios.delete(`/admin/categories/${id}`);
            fetchData();
        } catch (err) {
            console.error('Error deleting category', err);
        }
    };

    const handleAddBanner = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/admin/banners', newBanner);
            setNewBanner({ title: '', description: '', imageUrl: '', productSlug: '', isActive: true });
            fetchData();
        } catch (err) {
            console.error('Error adding banner', err);
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            await axios.delete(`/admin/banners/${id}`);
            fetchData();
        } catch (err) {
            console.error('Error deleting banner', err);
        }
    };

    const handleUpdateBanner = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/admin/banners/${editingBanner._id}`, editingBanner);
            setEditingBanner(null);
            fetchData();
        } catch (err) {
            console.error('Error updating banner', err);
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            // Prepare data: only send fields the backend expects and ensure category is just an ID
            const payload = {
                name: editingProduct.name,
                slug: editingProduct.slug,
                price: editingProduct.price,
                originalPrice: editingProduct.originalPrice,
                commissionPercentage: editingProduct.commissionPercentage,
                description: editingProduct.description,
                imageUrl: editingProduct.imageUrl,
                stock: editingProduct.stock,
                category: typeof editingProduct.category === 'object' ? editingProduct.category._id : editingProduct.category
            };

            await axios.put(`/admin/products/${editingProduct._id}`, payload);
            setEditingProduct(null);
            fetchData();
        } catch (err) {
            console.error('Error updating product', err);
            alert('Failed to update product: ' + (err.response?.data?.msg || err.message));
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

    const handleUpdateOrder = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/admin/orders/${editingOrder._id}`, editingOrder);
            setEditingOrder(null);
            fetchData();
        } catch (err) {
            console.error('Error updating order', err);
            alert('Failed to update order');
        }
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden text-slate-900 font-sans">
            <AdminSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isOpen={sidebarOpen} 
                setIsOpen={setSidebarOpen} 
                onLogout={logout}
            />

            {/* Content area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
                    <div className="text-lg font-bold tracking-tight">referal.amberbish</div>
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>
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
                                    { label: 'Inventory', val: data.products.length }
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
                                                        <div className="font-semibold">{u.email}</div>
                                                        <div className="text-xs text-slate-400 capitalize">{u.role}</div>
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
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                                                <tr>
                                                    <th className="px-6 py-3 font-semibold">Order Details</th>
                                                    <th className="px-6 py-3 font-semibold">Customer & Delivery</th>
                                                    <th className="px-6 py-3 font-semibold">Status</th>
                                                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {data.orders.map(o => (
                                                    <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-900">{o.productName}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">ID: {o.paymentId}</div>
                                                            <div className="text-xs font-bold text-slate-700 mt-1">₹{o.amount.toLocaleString()} • {o.paymentMethod}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-slate-900">{o.user?.email || 'Unknown User'}</div>
                                                            <div className="text-xs text-slate-500 mt-1 max-w-[200px] leading-tight">
                                                                <span className="font-bold text-slate-400">ADDR:</span> {o.shippingAddress || 'N/A'}
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-0.5">
                                                                <span className="font-bold text-slate-400">PH:</span> {o.phoneNumber || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${
                                                                o.status === 'Confirmed' ? 'bg-blue-500' :
                                                                o.status === 'Processing' ? 'bg-amber-500' :
                                                                o.status === 'Delivering' ? 'bg-indigo-500' :
                                                                'bg-emerald-500'
                                                            }`}>
                                                                {o.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button 
                                                                onClick={() => setEditingOrder(o)}
                                                                className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest"
                                                            >
                                                                Edit Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
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
                                                    <td className="px-6 py-4">{w.user.email}</td>
                                                    <td className="px-6 py-4 font-extrabold text-red-500">₹{w.amount}</td>
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-400 bg-slate-50 underline">{w.couponCode}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {activeTab === 'categories' && (
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <form onSubmit={handleAddCategory} className="space-y-4">
                                                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Add Taxonomy</h3>
                                                <input placeholder="Category Name (e.g. Gaming)" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" value={newCategory.name} onChange={(e) => setNewCategory({ name: e.target.value })} required />
                                                <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-bold tracking-tight">Save Category</button>
                                            </form>
                                            <div className="space-y-2">
                                                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Existing Tags</h3>
                                                {data.categories.map(cat => (
                                                    <div key={cat._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                                        <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                                                        <button onClick={() => handleDeleteCategory(cat._id)} className="text-slate-400 hover:text-red-600 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'banners' && (
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <form onSubmit={editingBanner ? handleUpdateBanner : handleAddBanner} className="space-y-4">
                                                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">{editingBanner ? 'Edit Hero Promo' : 'Create Hero Promo'}</h3>
                                                <input placeholder="Heading (e.g. Upto 13% Off)" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" value={editingBanner ? editingBanner.title : newBanner.title} onChange={(e) => editingBanner ? setEditingBanner({...editingBanner, title: e.target.value}) : setNewBanner({ ...newBanner, title: e.target.value })} required />
                                                <input placeholder="Description" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" value={editingBanner ? editingBanner.description : newBanner.description} onChange={(e) => editingBanner ? setEditingBanner({...editingBanner, description: e.target.value}) : setNewBanner({ ...newBanner, description: e.target.value })} />
                                                <input placeholder="Image URL" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" value={editingBanner ? editingBanner.imageUrl : newBanner.imageUrl} onChange={(e) => editingBanner ? setEditingBanner({...editingBanner, imageUrl: e.target.value}) : setNewBanner({ ...newBanner, imageUrl: e.target.value })} required />
                                                
                                                <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white" value={editingBanner ? editingBanner.productSlug : newBanner.productSlug} onChange={(e) => editingBanner ? setEditingBanner({...editingBanner, productSlug: e.target.value}) : setNewBanner({ ...newBanner, productSlug: e.target.value })}>
                                                    <option value="">Tag a Product (Optional)</option>
                                                    {data.products.map(p => (
                                                        <option key={p._id} value={p.slug}>{p.name}</option>
                                                    ))}
                                                </select>

                                                <div className="flex gap-2">
                                                    <button type="submit" className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-bold tracking-tight">{editingBanner ? 'Update Banner' : 'Post Banner'}</button>
                                                    {editingBanner && <button type="button" onClick={() => setEditingBanner(null)} className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold">Cancel</button>}
                                                </div>
                                            </form>
                                            <div className="space-y-4">
                                                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Active Promotions</h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {data.banners.map(b => (
                                                        <div key={b._id} className="relative group overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                                            <div className="flex items-center gap-4 p-4">
                                                                <img src={b.imageUrl} alt="" className="w-20 h-12 object-cover rounded-lg bg-white" />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-bold truncate">{b.title}</div>
                                                                    <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{b.productSlug || 'Generic'}</div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <button onClick={() => setEditingBanner(b)} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase">Edit</button>
                                                                    <button onClick={() => handleDeleteBanner(b._id)} className="text-slate-300 hover:text-red-600 transition-colors">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'products' && (
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                                                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">{editingProduct ? 'Edit SKU' : 'Add New'}</h3>
                                                <input placeholder="Name" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900" value={editingProduct ? editingProduct.name : newProduct.name} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} required />
                                                <input placeholder="SEO Slug (Optional)" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" value={editingProduct ? editingProduct.slug : newProduct.slug} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, slug: e.target.value}) : setNewProduct({...newProduct, slug: e.target.value})} />
                                                
                                                <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white" value={editingProduct ? editingProduct.category : newProduct.category} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}>
                                                    <option value="">Select Category</option>
                                                    {data.categories.map(cat => (
                                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                    ))}
                                                </select>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="number" placeholder="Sale Price" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" value={editingProduct ? editingProduct.price : newProduct.price} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} required />
                                                    <input type="number" placeholder="Original Price (MRP)" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" value={editingProduct ? editingProduct.originalPrice : newProduct.originalPrice} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, originalPrice: e.target.value}) : setNewProduct({...newProduct, originalPrice: e.target.value})} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Commission Rate (%)</label>
                                                    <input type="number" min="1" max="50" placeholder="Commission % (1-50)" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" value={editingProduct ? editingProduct.commissionPercentage : newProduct.commissionPercentage} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, commissionPercentage: e.target.value}) : setNewProduct({...newProduct, commissionPercentage: e.target.value})} required />
                                                </div>
                                                <input placeholder="Image URL" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" value={editingProduct ? editingProduct.imageUrl : newProduct.imageUrl} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, imageUrl: e.target.value}) : setNewProduct({...newProduct, imageUrl: e.target.value})} />
                                                <input type="number" placeholder="Inventory Stock" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-bold" value={editingProduct ? editingProduct.stock : newProduct.stock} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, stock: e.target.value}) : setNewProduct({...newProduct, stock: e.target.value})} required />
                                                <textarea placeholder="Redemption Instructions" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg h-24" value={editingProduct ? editingProduct.description : newProduct.description} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} />
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
                                                            <div className="text-xs text-slate-400">
                                                                ₹{p.price} {p.originalPrice && <span className="line-through opacity-50 ml-1">₹{p.originalPrice}</span>} • {p.commissionPercentage}% Comm. • {data.categories.find(c => c._id === p.category)?.name || 'No Category'}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button onClick={() => setEditingProduct({ ...p, category: p.category?._id || p.category })} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase">Edit</button>
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

            {/* Edit Order Modal */}
            {editingOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">Update Order</h3>
                            <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateOrder} className="p-8 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Delivery Status</label>
                                <select 
                                    value={editingOrder.status}
                                    onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                >
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Delivering">Delivering</option>
                                    <option value="Delivered">Delivered</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Shipping Address</label>
                                <textarea 
                                    value={editingOrder.shippingAddress}
                                    onChange={(e) => setEditingOrder({...editingOrder, shippingAddress: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium h-24 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                    placeholder="Enter full shipping address"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input 
                                    type="text"
                                    value={editingOrder.phoneNumber}
                                    onChange={(e) => setEditingOrder({...editingOrder, phoneNumber: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                    placeholder="Contact number"
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setEditingOrder(null)}
                                    className="flex-1 px-6 py-3 border border-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
