import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
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
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-slate-900 tracking-tight" onClick={closeMenu}>
                    referal.amberbisht.me
                </Link>

                {/* Mobile menu button */}
                <button onClick={toggleMenu} className="md:hidden text-slate-500 focus:outline-none p-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-6 items-center">
                    {user ? (
                        <>
                            <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Shop</Link>
                            <Link to="/my-purchases" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Orders</Link>
                            <Link to="/earnings" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Earnings</Link>
                            <Link to="/referrals" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Referrals</Link>
                            <Link to="/profile" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mr-2">Profile</Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">Admin</Link>
                            )}
                            <button onClick={handleLogout} className="text-sm font-bold text-slate-900 border-l border-slate-200 pl-6 ml-2 hover:text-red-600 transition-colors">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
                            <Link to="/signup" className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl py-6 flex flex-col gap-4 px-6 animate-in slide-in-from-top-4 duration-300">
                    {user ? (
                        <>
                            <Link to="/" className="text-md font-bold text-slate-900" onClick={closeMenu}>Shop</Link>
                            <Link to="/my-purchases" className="text-md font-bold text-slate-900" onClick={closeMenu}>Orders</Link>
                            <Link to="/earnings" className="text-md font-bold text-slate-900" onClick={closeMenu}>Earnings</Link>
                            <Link to="/referrals" className="text-md font-bold text-slate-900" onClick={closeMenu}>Referrals</Link>
                            <Link to="/profile" className="text-md font-bold text-slate-900" onClick={closeMenu}>Profile</Link>
                            <div className="h-px bg-slate-100 my-2"></div>
                            <button onClick={handleLogout} className="text-md font-bold text-red-600 text-left">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-md font-bold text-slate-900" onClick={closeMenu}>Login</Link>
                            <Link to="/signup" className="w-full py-3 bg-slate-900 text-white rounded-xl text-center font-bold" onClick={closeMenu}>Sign Up</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
