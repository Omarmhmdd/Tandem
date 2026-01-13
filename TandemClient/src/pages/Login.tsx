    import React, { useState } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { useAuth } from '../contexts/AuthContext';
    import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
    import { Button } from '../components/ui/Button';
    import { Input } from '../components/ui/Input';
    import { Logo } from '../components/Logo';
    import { showToast } from '../utils/toast';
    import { FeatureCarousel } from '../components/auth/FeatureCarousel';

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
        {/* Left side - Feature Carousel */}
        <FeatureCarousel type="login" />

        {/* Right side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 h-screen overflow-hidden">
            <div className="w-full max-w-md">
            <div className="lg:hidden mb-6 text-center">
                <Logo size="lg" />
            </div>
            
            <Card className="border-0 shadow-lg">
                <CardHeader className="space-y-3 pb-4">
                {/* Logo and Brand Name - In white form section */}
                <div className="flex flex-col items-center mb-2">
                    <Logo size="md" showText={true} variant="dark" />
                </div>
                
                <div className="text-center space-y-1">
                    <CardTitle className="text-xl font-semibold text-gray-900 font-sans">
                        Sign in to your account
                    </CardTitle>
                    <p className="text-xs text-gray-600 font-sans">
                        Enter your credentials to continue
                    </p>
                </div>
                </CardHeader>
                <CardContent className="pb-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                    <label 
                        htmlFor="email" 
                        className="block text-xs font-medium text-gray-700 mb-1.5"
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
                        className="text-sm py-2"
                    />
                    </div>
                    <div>
                    <label 
                        htmlFor="password" 
                        className="block text-xs font-medium text-gray-700 mb-1.5"
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
                        className="text-sm py-2"
                    />
                    </div>
                    <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-4"
                    disabled={isLoading}
                    >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
                <div className="mt-4 text-center">
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