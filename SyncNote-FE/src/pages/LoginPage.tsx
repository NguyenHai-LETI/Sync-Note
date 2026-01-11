import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuthStore } from '../stores/authStore';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await client.post('auth/login', { email, password });
            if (response.data.success !== false) { // Handle standardized response
                // Response structure from backend walkthrough: { refresh: "...", access: "..." }
                // But standardized response wraps it in "data".
                // Let's check backend code: LinkTokenObtainPairView inherits TokenObtainPairView.
                // Renderer wraps it. So response/data/data? No, renderer wraps the DRF response.
                // If DRF returns { access, refresh }, renderer returns { success: true, data: { access, refresh } }.
                const { access, refresh } = response.data.data;
                login(access, refresh);
                navigate('/');
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{ padding: 'var(--main-padding)', width: '100%', boxSizing: 'border-box' }}>
            <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.75rem' }}>Welcome Back</h2>
                {error && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e7e5e4', outline: 'none', boxSizing: 'border-box' }}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e7e5e4', outline: 'none', boxSizing: 'border-box' }}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.8rem' }}>Login</button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#78716c' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#292524', fontWeight: 600 }}>Create account</Link>
                </div>
            </div>
        </div>
    );
};
