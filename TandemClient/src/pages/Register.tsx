    import React, { useState } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { useAuth } from '../contexts/AuthContext';
    import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
    import { Button } from '../components/ui/Button';
    import { Input } from '../components/ui/Input';
    import { Logo } from '../components/Logo';
    import { showToast } from '../utils/toast';
    import { validatePassword, validatePasswordMatch } from '../utils/authValidators';
    import { PasswordValidationChecklist } from '../components/auth/PasswordValidationChecklist';
    import { FeatureCarousel } from '../components/auth/FeatureCarousel';

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
        <div className="min-h-screen flex relative overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Left side - Feature Carousel */}
        <FeatureCarousel type="signup" />

        {/* Right side - Register Form */}
        <div className="flex-1 flex items-center justify-center p-6 h-screen overflow-hidden relative bg-gray-50">
            
            <div className="w-full max-w-md relative z-10">
            <div className="lg:hidden mb-6 text-center">
                <Logo size="lg" />
            </div>
            
            <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/95 -ml-8 lg:-ml-16">
                <CardHeader className="space-y-3 pb-4">
                {/* Logo and Brand Name - In white form section */}
                <div className="flex flex-col items-center mb-2">
                    <Logo size="md" showText={true} variant="dark" />
                </div>
                
                <div className="text-center space-y-1">
                    <CardTitle className="text-xl font-semibold text-gray-900 font-sans">
                        Create your account
                    </CardTitle>
                    <p className="text-xs text-gray-600 font-sans">
                        Fill in your details to get started
                    </p>
                </div>
                </CardHeader>
                <CardContent className="pb-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label 
                        htmlFor="firstName" 
                        className="block text-xs font-medium text-gray-700 mb-1.5"
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
                        className="text-sm py-2"
                        />
                    </div>
                    <div>
                        <label 
                        htmlFor="lastName" 
                        className="block text-xs font-medium text-gray-700 mb-1.5"
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
                        className="text-sm py-2"
                        />
                    </div>
                    </div>
                    <div>
                    <label 
                        htmlFor="email" 
                        className="block text-xs font-medium text-gray-700 mb-1.5"
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
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                        className="text-sm py-2"
                    />
                    <PasswordValidationChecklist
                        password={formData.password}
                        confirmPassword={formData.confirmPassword}
                    />
                    </div>
                    <div>
                    <label 
                        htmlFor="confirmPassword" 
                        className="block text-xs font-medium text-gray-700 mb-1.5"
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
                        className="text-sm py-2"
                    />
                    </div>
                    <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-4"
                    disabled={isLoading}
                    >
                    {isLoading ? 'Creating account...' : 'Create account'}
                    </Button>
                </form>
                <div className="mt-4 text-center">
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