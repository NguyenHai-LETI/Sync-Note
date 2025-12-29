import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSyncStore } from '../stores/syncStore';
import { LogOut, Menu, Plus, RefreshCw } from 'lucide-react';
import { CategoryList } from './CategoryList';

export const DashboardLayout = () => {
    const logout = useAuthStore((state) => state.logout);
    const { sync, isSyncing } = useSyncStore();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar */}
            <aside style={{
                width: isSidebarOpen ? '250px' : '0',
                transition: 'width 0.3s',
                borderRight: '1px solid #ddd',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f9f9f9',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>SyncNote</h3>
                    <button onClick={() => sync()} disabled={isSyncing} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} title="Sync Now">
                        <RefreshCw size={18} className={isSyncing ? 'spin' : ''} />
                    </button>
                    <style>{`
                        .spin { animation: spin 1s linear infinite; }
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    <CategoryList />
                </div>

                <div style={{ padding: '1rem', borderTop: '1px solid #ddd' }}>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem', cursor: 'pointer', border: 'none', background: 'transparent' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <header style={{ padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ marginRight: '1rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                        <Menu size={20} />
                    </button>
                    <h2>Notes</h2>
                </header>
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
