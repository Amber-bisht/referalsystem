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
        <nav className="border-b border-gray-200 py-4 mb-8 bg-white relative z-50">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold tracking-widest uppercase" onClick={closeMenu}>LuxeStream</Link>

                {/* Mobile menu button */}
                <button onClick={toggleMenu} className="md:hidden focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-4 items-center">
                    {user ? (
                        <>
                            <Link to="/shop" className="btn btn-outline text-sm">Shop</Link>
                            <Link to="/my-purchases" className="btn btn-outline text-sm">Orders</Link>
                            <Link to="/profile" className="btn btn-outline text-sm">Profile</Link>
                            <Link to="/earnings" className="btn btn-outline text-sm">Earnings</Link>
                            <Link to="/referrals" className="btn btn-outline text-sm">Referrals</Link>
                            <button onClick={handleLogout} className="btn btn-primary text-sm">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline text-sm">Login</Link>
                            <Link to="/signup" className="btn btn-primary text-sm">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg py-4 flex flex-col gap-4 px-4">
                    {user ? (
                        <>
                            <Link to="/shop" className="btn btn-outline text-sm text-center" onClick={closeMenu}>Shop</Link>
                            <Link to="/my-purchases" className="btn btn-outline text-sm text-center" onClick={closeMenu}>Orders</Link>
                            <Link to="/profile" className="btn btn-outline text-sm text-center" onClick={closeMenu}>Profile</Link>
                            <Link to="/earnings" className="btn btn-outline text-sm text-center" onClick={closeMenu}>Earnings</Link>
                            <Link to="/referrals" className="btn btn-outline text-sm text-center" onClick={closeMenu}>Referrals</Link>
                            <button onClick={handleLogout} className="btn btn-primary text-sm w-full">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline text-sm text-center" onClick={closeMenu}>Login</Link>
                            <Link to="/signup" className="btn btn-primary text-sm text-center" onClick={closeMenu}>Sign Up</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
