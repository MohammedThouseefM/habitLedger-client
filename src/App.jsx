import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SyncProvider } from './contexts/SyncContext';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import TimeTracking from './pages/TimeTracking';
import Notes from './pages/Notes';
import Events from './pages/Events';
import Layout from './components/Layout';


function App() {
    return (
        <Router>
            <AuthProvider>
                <SyncProvider>
                    <Layout>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/time-tracking" element={<TimeTracking />} />
                            <Route path="/notes" element={<Notes />} />
                            <Route path="/events" element={<Events />} />

                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </Layout>
                </SyncProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
