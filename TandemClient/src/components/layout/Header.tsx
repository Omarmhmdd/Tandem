    import React, { useState, useEffect, useRef } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Logo } from '../Logo';
    import { Settings, User, Menu, LogOut } from 'lucide-react';
    import { MobileNav } from './MobileNav';
    import { useAuth } from '../../contexts/AuthContext';

    export const Header: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setUserMenuOpen(false);
        }
        };

        if (userMenuOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setUserMenuOpen(false);
    };

    return (
        <>
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between h-16">
                {/* Mobile Menu Button */}
                <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-brand-primary hover:bg-brand-light/20 rounded-lg transition-colors"
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav"
                >
                <Menu className="w-6 h-6" />
                </button>

                {/* Logo */}
                <div className="flex-1 lg:flex-none ml-4 lg:ml-0">
                <Logo size="md" />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                {/* Settings */}
                <button 
                    onClick={() => navigate('/settings')}
                    className="hidden sm:block p-2 text-gray-600 hover:text-brand-primary hover:bg-brand-light/20 rounded-lg transition-colors"
                    aria-label="Settings"
                >
                    <Settings className="w-5 h-5" />
                </button>

                {/* User Avatar */}
                <div className="relative" ref={userMenuRef}>
                    <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brand-light/20 transition-colors"
                    aria-label="User menu"
                    >
                    <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user?.firstName?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                    {user && (
                        <span className="hidden sm:block text-sm font-semibold text-[#53389E]">
                        {user.firstName}
                        </span>
                    )}
                    </button>
                    
                    {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                        <LogOut className="w-4 h-4" />
                        Logout
                        </button>
                    </div>
                    )}
                </div>
                </div>
            </div>
            </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </>
    );
    };