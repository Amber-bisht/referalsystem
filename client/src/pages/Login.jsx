import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="min-h-[80vh] flex justify-center items-center px-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                    <p className="text-sm text-slate-500 mt-2">Log in to manage your referrals</p>
                </div>

                {error && (
                    <div className="p-3 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition-all text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition-all text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-sm pt-4 mt-2"
                    >
                        Sign in
                    </button>
                </form>

                <div className="text-center mt-8 text-sm text-slate-500">
                    Don't have an account? <Link to="/signup" className="text-slate-900 font-bold hover:underline">Create one</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
