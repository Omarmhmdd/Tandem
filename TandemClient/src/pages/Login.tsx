    import React, { useState } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { useAuth } from '../contexts/AuthContext';
    import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
    import { Button } from '../components/ui/Button';
    import { Input } from '../components/ui/Input';
    import { Logo } from '../components/Logo';
    import { showToast } from '../utils/toast';

    export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const result = await login(email, password);
        
        if (result.success) {
        showToast('Login successful!', 'success');
        navigate('/');
        } else {
        showToast(result.error || 'Invalid email or password', 'error');
        }
    } catch (error) {
        showToast('Login failed. Please try again.', 'error');
    } finally {
        setIsLoading(false);
    }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
        {/* Left side - Branding */}
    <div className="hidden lg:flex lg:w-1/2 bg-[#53389E] items-center justify-center p-12">
    <div className="max-w-md">
        <Logo size="lg" showText={true} variant="light" className="mb-8" />
        <h2 className="text-3xl font-bold text-white mb-4">
        Welcome back to Tandem
        </h2>
        <p className="text-white text-lg opacity-90">
        Your partner in building healthier relationships and better habits together.
        </p>
    </div>
    </div>

        {/* Right side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
                <Logo size="lg" />
            </div>
            
            <Card className="border-0 shadow-lg">
                <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">
                    Sign in to your account
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Enter your credentials to continue
                </p>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                    <label 
                        htmlFor="email" 
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Email address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        required
                        disabled={isLoading}
                        autoComplete="email"
                    />
                    </div>
                    <div>
                    <label 
                        htmlFor="password" 
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Password
                    </label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                    />
                    </div>
                    <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isLoading}
                    >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link 
                        to="/register" 
                        className="font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
                    >
                        Sign up
                    </Link>
                    </p>
                </div>
                </CardContent>
            </Card>
            </div>
        </div>
        </div>
    );
    };