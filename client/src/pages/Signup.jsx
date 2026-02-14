import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

const Signup = () => {
    // Check for referral code in query params
    const [searchParams] = useSearchParams();
    const initialRefCode = searchParams.get('ref') || '';

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [referralCode, setReferralCode] = useState(initialRefCode);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(username, email, password, referralCode);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-2xl text-center mb-4">Sign Up</h2>
                {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Referral Code (Optional)"
                        className="input"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">Sign Up</button>
                </form>
                <div className="text-center mt-4 text-sm">
                    Already have an account? <Link to="/login" className="text-gray">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
