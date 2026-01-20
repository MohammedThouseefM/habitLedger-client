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
import ProtectedRoute from './components/ProtectedRoute';


function App() {
    return (
        <Router>
            <AuthProvider>
                <SyncProvider>
                    <Routes>
                        {/* Public Routes - No Layout */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* Protected Routes - With Layout */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Dashboard />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/time-tracking"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <TimeTracking />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/notes"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Notes />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/events"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Events />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Redirect root to dashboard */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </SyncProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
