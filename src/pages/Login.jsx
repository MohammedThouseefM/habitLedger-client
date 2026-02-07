import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    TrendingUp,
    Shield,
    Mail,
    AtSign,
    Lock,
    User,
    ArrowRight,
    Loader2,
    Sparkles
} from 'lucide-react';
import api from '../utils/api';

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, isAuthenticated } = useAuth();

    // State
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(searchParams.get('error') ? 'Authentication failed' : '');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleGoogleLogin = () => {
        const API_URL = import.meta.env.VITE_API_URL || 'https://habitledger-server.onrender.com';
        window.location.href = `${API_URL}/auth/google`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : formData;

            const response = await api.post(endpoint, payload);

            if (response.data.token) {
                login(response.data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg flex relative overflow-hidden font-sans text-text">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse-subtle" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse-subtle" style={{ animationDelay: '1s' }} />
            </div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen gap-12 lg:gap-24">

                {/* Left Side - Hero Section */}
                <div className="hidden md:flex flex-col flex-1 space-y-8 max-w-xl animate-fade-in">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border backdrop-blur-sm text-xs font-medium text-primary">
                            <Sparkles size={14} />
                            <span>Build Better Habits</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-text">
                            Master Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                Daily Routine
                            </span>
                        </h1>
                        <p className="text-lg text-text-secondary leading-relaxed max-w-md">
                            Track progress, analyze patterns, and achieve your goals with our premium analytic tools designed for high performers.
                        </p>
                    </div>

                    <div className="grid gap-4 opacity-80">
                        <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel hover:border-primary/30 transition-colors group cursor-default">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                <LayoutDashboard size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-text">Visual Dashboard</h3>
                                <p className="text-sm text-text-secondary">Overview of your entire journey</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel hover:border-accent/30 transition-colors group cursor-default">
                            <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-text">Smart Analytics</h3>
                                <p className="text-sm text-text-secondary">Data-driven insights for growth</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Auth Card */}
                <div className="w-full max-w-md">
                    <div className="relative">
                        {/* Card Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl opacity-20 blur-lg" />

                        <div className="relative glass-card p-8 rounded-3xl shadow-2xl">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-text">
                                    {isLogin ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <p className="text-sm text-text-secondary mt-2">
                                    {isLogin ? 'Enter your credentials to access your account' : 'Start your journey to self-improvement'}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm animate-fade-in">
                                    <Shield size={16} />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {!isLogin && (
                                    <div className="space-y-1.5 align-left text-left">
                                        <label className="text-xs font-medium text-text-secondary ml-1">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                required={!isLogin}
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="input-premium pl-10"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5 align-left text-left">
                                    <label className="text-xs font-medium text-text-secondary ml-1">Email Address</label>
                                    <div className="relative group">
                                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="input-premium pl-10"
                                            placeholder="Email address"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 align-left text-left">
                                    <label className="text-xs font-medium text-text-secondary ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="input-premium pl-10"
                                            placeholder="Password"
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn btn-primary py-3.5 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin ? 'Sign In' : 'Create Account'}
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-800"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                                        <span className="px-3 bg-surface text-text-secondary">Or continue with</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGoogleLogin}
                                    type="button"
                                    className="mt-6 w-full bg-white border border-border text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 relative overflow-hidden group shadow-sm"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            className="text-blue-500"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            className="text-green-500"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            className="text-yellow-500"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            className="text-red-500"
                                        />
                                    </svg>
                                    <span>Google</span>
                                </button>
                            </div>

                            <div className="mt-8 text-center text-sm">
                                <p className="text-slate-500">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setError('');
                                        }}
                                        className="font-medium text-primary hover:text-primary-dark hover:underline transition-all"
                                    >
                                        {isLogin ? 'Sign up' : 'Log in'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
