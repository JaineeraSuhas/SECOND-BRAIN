import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';

// Pages (we'll create these next)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GraphPage from './pages/GraphPage';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';
import AboutPage from './pages/AboutPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { ToastContainer } from './components';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                <div className="liquid-glass p-8 rounded-2xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer />
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
                    <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
                    <Route path="/about" element={<AboutPage />} />

                    {/* Protected routes */}
                    <Route
                        path="/dashboard"
                        element={user ? <DashboardPage /> : <Navigate to="/login" />}
                    />
                    <Route path="/graph" element={user ? <GraphPage /> : <Navigate to="/login" />} />
                    <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/login" />} />
                    <Route
                        path="/documents"
                        element={user ? <DocumentsPage /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/analytics"
                        element={user ? <AnalyticsPage /> : <Navigate to="/login" />}
                    />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
