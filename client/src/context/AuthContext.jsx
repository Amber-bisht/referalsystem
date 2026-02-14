import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Configure axios defaults
    axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
    if (token) {
        axios.defaults.headers.common['Authorization'] = token;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get('/auth/user');
                setUser(res.data);
            } catch (err) {
                console.error('Error loading user', err);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.msg || 'Login failed' };
        }
    };

    const register = async (username, email, password, referralCode) => {
        try {
            const res = await axios.post('/auth/signup', { username, email, password, referralCode });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.msg || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const res = await axios.get('/auth/user');
            setUser(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
