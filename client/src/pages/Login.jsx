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
        <div className="min-h-screen flex justify-center items-center">
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-2xl text-center mb-4">Login</h2>
                {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                <div className="text-center mt-4 text-sm">
                    Don't have an account? <Link to="/signup" className="text-gray">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
