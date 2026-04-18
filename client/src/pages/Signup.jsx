import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

const Signup = () => {
    const [searchParams] = useSearchParams();
    const initialRefCode = searchParams.get('ref') || '';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [referralCode, setReferralCode] = useState(initialRefCode);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(email, password, referralCode);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="min-h-[80vh] flex justify-center items-center px-4 py-12">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
                    <p className="text-sm text-slate-500 mt-2">Join the referral network today</p>
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
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Referral Code (Optional)</label>
                        <input
                            type="text"
                            placeholder="REF123"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition-all text-sm uppercase font-semibold"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-sm mt-4 pt-4"
                    >
                        Sign up
                    </button>
                </form>

                <div className="text-center mt-8 text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="text-slate-900 font-bold hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
