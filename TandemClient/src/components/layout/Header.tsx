    import React, { useState, useEffect, useRef } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Logo } from '../Logo';
    import { Settings, User, Menu, LogOut } from 'lucide-react';
    import { MobileNav } from './MobileNav';
    import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../NotificationBell';

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
                      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20 gap-4">
                        {/* Left side: Mobile Menu + Logo */}
                       <div className="flex items-center gap-3 lg:gap-0 -ml-4 lg:-ml-2">
                {/* Mobile Menu Button */}
                <button
                onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2.5 text-gray-600 hover:text-brand-primary hover:bg-brand-light/20 rounded-lg transition-colors"
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav"
                >
                            <Menu className="w-5 h-5" />
                </button>

                {/* Logo */}
                        <div>
                <Logo size="md" />
                </div>
                </div>
                

              {/* Right side: Actions */}
                      <div className="flex items-center gap-3 sm:gap-4 -mr-2 lg:-mr-4">
                {/* Settings */}
                <button 
                    onClick={() => navigate('/settings')}
                                className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-[#53389E] hover:bg-purple-50 rounded-lg transition-all border border-transparent hover:border-purple-200"
                    aria-label="Settings"
                >
                                <Settings className="w-4.5 h-4.5 stroke-[1.5]" />
                    <span className="text-sm font-medium">Settings</span>
                </button>

                            {/* Notifications */}
                            <NotificationBell />

                {/* User Avatar */}
                <div className="relative" ref={userMenuRef}>
                    <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-purple-50 transition-all border border-transparent hover:border-purple-200"
                    aria-label="User menu"
                    >
                    <div className="w-9 h-9 bg-gradient-to-br from-[#53389E] to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {user?.firstName?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                    {user && (
                        <div className="hidden sm:flex flex-col items-start">
                                            <span className="text-sm font-semibold text-gray-900 leading-tight">
                                {user.firstName}
                            </span>
                            {user.lastName && (
                                <span className="text-xs text-gray-500 leading-tight">
                                    {user.lastName}
                                </span>
                            )}
                        </div>
                    )}
                    </button>
                    
                    {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                        </div>
                        <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors"
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