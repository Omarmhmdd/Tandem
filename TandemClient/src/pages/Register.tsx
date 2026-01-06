    import React, { useState } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { useAuth } from '../contexts/AuthContext';
    import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
    import { Button } from '../components/ui/Button';
    import { Input } from '../components/ui/Input';
    import { Logo } from '../components/Logo';
    import { showToast } from '../utils/toast';
    import { validatePassword, validatePasswordMatch } from '../utils/authValidators';

    export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({email: '',password: '',confirmPassword: '',firstName: '',lastName: '',});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const matchValidation = validatePasswordMatch(formData.password,formData.confirmPassword);
        if (!matchValidation.isValid) {
        showToast(matchValidation.error!, 'error');
        return;
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
        showToast(passwordValidation.error!, 'error');
        return;
        }

        setIsLoading(true);

            try {
        const result = await register(formData.email,formData.password,formData.firstName,formData.lastName);

        if (result.success) {
            showToast('Registration successful!', 'success');
            navigate('/');
        } else {
            showToast(result.error || 'Registration failed. Please try again.', 'error');
        }
        } catch (error: any) {
        const errorMessage = error?.message || 'Registration failed. Please try again.';
        showToast(errorMessage, 'error');
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
        Start your journey together
        </h2>
        <p className="text-white text-lg opacity-90">
        Join Tandem and build healthier relationships with your partner through shared goals and habits.
        </p>
    </div>
    </div>

        {/* Right side - Register Form */}
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
                <Logo size="lg" />
            </div>
            
            <Card className="border-0 shadow-lg">
                <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">
                    Create your account
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Fill in your details to get started
                </p>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label 
                        htmlFor="firstName" 
                        className="block text-sm font-medium text-gray-700 mb-2"
                        >
                        First name
                        </label>
                        <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                        disabled={isLoading}
                        autoComplete="given-name"
                        />
                    </div>
                    <div>
                        <label 
                        htmlFor="lastName" 
                        className="block text-sm font-medium text-gray-700 mb-2"
                        >
                        Last name
                        </label>
                        <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                        disabled={isLoading}
                        autoComplete="family-name"
                        />
                    </div>
                    </div>
                    <div>
                    <label 
                        htmlFor="email" 
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Email address
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
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
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                        Must be at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                    </div>
                    <div>
                    <label 
                        htmlFor="confirmPassword" 
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Confirm password
                    </label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                    />
                    </div>
                    <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isLoading}
                    >
                    {isLoading ? 'Creating account...' : 'Create account'}
                    </Button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link 
                        to="/login" 
                        className="font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
                    >
                        Sign in
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