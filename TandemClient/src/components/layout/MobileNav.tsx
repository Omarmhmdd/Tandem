    import React, { useCallback, useEffect } from 'react';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { X, LayoutDashboard, ShoppingBag, UtensilsCrossed, Heart, Target, TrendingUp, Calendar, MessageSquare, CheckSquare, DollarSign } from 'lucide-react';
    import { useAuth } from '../../contexts/AuthContext';
    import { useHousehold } from '../../contexts/HouseholdContext';
    import { useHouseholdMembers } from '../../api/queries/household';
    import type { NavItem } from '../../types/navigation.types';

    const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Health Logger', icon: Heart, path: '/health' },
    { label: 'Habits', icon: CheckSquare, path: '/habits' },
    { label: 'Pantry', icon: ShoppingBag, path: '/pantry' },
    { label: 'Meal Planner', icon: UtensilsCrossed, path: '/meals' },
    { label: 'Recipes', icon: Calendar, path: '/recipes' },
    { label: 'Goals', icon: Target, path: '/goals' },
    { label: 'Budget', icon: DollarSign, path: '/budget' },
    { label: 'Mood Timeline', icon: Heart, path: '/mood-timeline' },
    { label: 'Date Night', icon: Calendar, path: '/date-night' },
    { label: 'Analytics', icon: TrendingUp, path: '/analytics' },
    { label: 'AI Coach', icon: MessageSquare, path: '/coach' },
    ];

    interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
    }

    export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { household } = useHousehold();
    const { data: members = [] } = useHouseholdMembers(household?.id || '');

    // Memoized navigation handler
    const handleNavigate = useCallback((path: string) => {
        navigate(path);
        onClose();
    }, [navigate, onClose]);

    // ESC key handler
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
        document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
        document.body.style.overflow = 'hidden';
        } else {
        document.body.style.overflow = '';
        }

        return () => {
        document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Get household initial for avatar
    const householdInitial = household?.name?.[0]?.toUpperCase() || 'H';
    const memberCount = members.length || 0;

    return (
        <>
        {/* Backdrop */}
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
        />
        
        {/* Drawer */}
        <div
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close navigation menu"
            >
                <X className="w-5 h-5 text-gray-600" />
            </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`
                    w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg
                    transition-all duration-200
                    ${
                        isActive
                        ? 'bg-brand-primary text-white shadow-brand'
                        : 'text-gray-700 hover:bg-brand-light/30 hover:text-brand-primary'
                    }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                >
                    <Icon className="mr-3 w-5 h-5 flex-shrink-0" />
                    {item.label}
                </button>
                );
            })}
            </nav>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-[#53389E] to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    <span>{householdInitial}</span>
                </div>
                </div>
                <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {household?.name || 'Our Home'}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                    {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </p>
                </div>
            </div>
            </div>
        </div>
        </>
    );
    };