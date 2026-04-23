import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="bg-white border-b border-slate-100 py-4 sticky top-0 z-50">
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2 uppercase" onClick={closeMenu}>
                    <div className="w-1.5 h-6 bg-slate-900"></div>
                    <span>referalsystem</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-8 items-center">
                    <Link to="/" className="text-[11px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">Shop</Link>
                    {user ? (
                        <>
                            <Link to="/my-purchases" className="text-[11px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">Orders</Link>
                            <Link to="/earnings" className="text-[11px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">Earnings</Link>
                            <Link to="/referrals" className="text-[11px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">Network</Link>
                            <Link to="/profile" className="text-[11px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">Profile</Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-[9px] font-black text-slate-900 bg-slate-100 px-2 py-1 rounded tracking-tighter uppercase">Admin Panel</Link>
                            )}
                            
                            <div className="h-4 w-px bg-slate-200 mx-2"></div>
                            
                            <Link to="/cart" className="relative p-2 text-slate-900 hover:scale-110 transition-transform group">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                                {getCartCount() > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-slate-900 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{getCartCount()}</span>
                                )}
                            </Link>

                            <button onClick={handleLogout} className="text-[11px] font-black text-slate-900 hover:text-red-600 transition-colors uppercase tracking-widest">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/cart" className="relative p-2 text-slate-900 hover:scale-110 transition-transform group">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                                {getCartCount() > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-slate-900 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{getCartCount()}</span>
                                )}
                            </Link>
                            <Link to="/login" className="text-[11px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">Login</Link>
                            <Link to="/signup" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-sm">Join System</Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <div className="flex items-center gap-4 md:hidden">
                    <Link to="/cart" className="relative p-2 text-slate-900">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                        {getCartCount() > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-slate-900 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{getCartCount()}</span>
                        )}
                    </Link>
                    <button onClick={toggleMenu} className="text-slate-900 focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl py-8 flex flex-col gap-6 px-8 animate-in slide-in-from-top-4 duration-300">
                    {user ? (
                        <>
                            <Link to="/" className="text-sm font-black text-slate-900 uppercase tracking-widest" onClick={closeMenu}>Shop</Link>
                            <Link to="/my-purchases" className="text-sm font-black text-slate-900 uppercase tracking-widest" onClick={closeMenu}>Orders</Link>
                            <Link to="/earnings" className="text-sm font-black text-slate-900 uppercase tracking-widest" onClick={closeMenu}>Earnings</Link>
                            <Link to="/referrals" className="text-sm font-black text-slate-900 uppercase tracking-widest" onClick={closeMenu}>Network</Link>
                            <Link to="/profile" className="text-sm font-black text-slate-900 uppercase tracking-widest" onClick={closeMenu}>Profile</Link>
                            <div className="h-px bg-slate-50 my-2"></div>
                            <button onClick={handleLogout} className="text-sm font-black text-red-600 uppercase tracking-widest text-left">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-black text-slate-900 uppercase tracking-widest" onClick={closeMenu}>Login</Link>
                            <Link to="/signup" className="w-full py-4 bg-slate-900 text-white rounded-lg text-center text-[11px] font-black uppercase tracking-[0.2em]" onClick={closeMenu}>Join System</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
