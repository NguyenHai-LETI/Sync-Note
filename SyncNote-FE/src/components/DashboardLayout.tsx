import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSyncStore } from '../stores/syncStore';
import { LogOut, Menu } from 'lucide-react';
import { CategoryList } from './CategoryList';

export const DashboardLayout = () => {
    const logout = useAuthStore((state) => state.logout);
    const { sync } = useSyncStore();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(true);
            else if (isSidebarOpen && !mobile) setSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        sync();
    }, []);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
            {/* Backdrop for mobile */}
            {isMobile && isSidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        zIndex: 40,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                position: isMobile ? 'fixed' : 'relative',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 50,
                width: isSidebarOpen ? 'var(--sidebar-width)' : '0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--card-bg)',
                overflow: 'hidden',
                boxShadow: isMobile && isSidebarOpen ? '4px 0 15px rgba(0,0,0,0.1)' : 'none'
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 'var(--header-height)', boxSizing: 'border-box' }}>
                    <h3 style={{ margin: 0, color: 'var(--accent-color)' }}>SyncNote</h3>
                    {isMobile && (
                        <button onClick={() => setSidebarOpen(false)} style={{ border: 'none', background: 'transparent', padding: '4px' }}>
                            <Menu size={20} />
                        </button>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    <CategoryList onSelect={() => isMobile && setSidebarOpen(false)} />
                </div>

                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', padding: '0.75rem', cursor: 'pointer', border: 'none', background: 'transparent', borderRadius: '8px', color: 'var(--text-secondary)' }} className="hover-bg">
                        <LogOut size={18} /> <span style={{ fontWeight: 500 }}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <header style={{
                    padding: '0 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    height: 'var(--header-height)',
                    backgroundColor: 'var(--card-bg)',
                    boxSizing: 'border-box'
                }}>
                    <button onClick={toggleSidebar} style={{ marginRight: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
                        <Menu size={22} color="var(--accent-color)" />
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Notes</h2>
                </header>
                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--main-padding)', backgroundColor: 'var(--bg-color)' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};
