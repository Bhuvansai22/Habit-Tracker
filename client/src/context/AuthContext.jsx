import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('hf_token');
        if (token) {
            api.get('/auth/me')
                .then((res) => setUser(res.data))
                .catch(() => sessionStorage.removeItem('hf_token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        sessionStorage.setItem('hf_token', data.token);
        setUser(data);
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        sessionStorage.setItem('hf_token', data.token);
        setUser(data);
        return data;
    };

    const logout = () => {
        sessionStorage.removeItem('hf_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
