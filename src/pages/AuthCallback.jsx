import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            login(token);
            navigate('/dashboard');
        } else {
            navigate('/login?error=no_token');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
            <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Completing sign in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
