import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, TrendingUp, CheckCircle, Mail, Lock, User, ArrowRight, Loader } from 'lucide-react';
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
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
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
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding (Hidden on mobile for better focus) */}
                <div className="hidden md:block text-left space-y-6 animate-fade-in">
                    <div className="inline-block">
                        <h1 className="text-6xl font-bold gradient-text mb-2">
                            Habit Tracker
                        </h1>
                        <p className="text-xl text-gray-600">
                            {isLogin ? 'Welcome back! Ready to crush your goals?' : 'Join us and start building better habits today.'}
                        </p>
                    </div>

                    <div className="space-y-4 mt-8">
                        <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800">Track Daily Progress</h3>
                                <p className="text-gray-600">Visual calendar view to monitor your habits</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-6 h-6 text-accent-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800">Analyze Performance</h3>
                                <p className="text-gray-600">Beautiful charts and statistics</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Auth Card */}
                <div className="card max-w-md mx-auto w-full animate-slide-up bg-white/80 backdrop-blur-lg border border-white/50 shadow-2xl">
                    <div className="p-4 sm:p-6">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-gray-600">
                                {isLogin ? 'Enter your details to sign in' : 'Start your journey with us'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                                <div className="w-1 h-1 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required={!isLogin}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary py-3.5 mt-2 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                type="button"
                                className="mt-6 w-full btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                    }}
                                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                    {isLogin ? 'Sign up' : 'Log in'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
