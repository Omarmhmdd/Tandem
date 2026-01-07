import React from 'react';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Heart, Target, TrendingUp, Calendar, MessageSquare, Home, CheckSquare, DollarSign } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
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

export const Sidebar: React.FC = () => {
const location = useLocation();
const navigate = useNavigate();

    return (
        <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                const Icon = item.icon;
                // Only highlight if pathname exactly matches (not just starts with)
                const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
                
                return (
                    <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`
                        w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                        transition-all duration-200
                        ${
                        isActive
                            ? 'bg-[#53389E] text-white shadow-brand'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                    `}
                    >
                    <Icon
                        className={`
                        mr-3 flex-shrink-0 w-5 h-5
                        ${isActive ? 'text-white' : 'text-gray-600'}
                        `}
                    />
                    {item.label}
                    {item.badge && (
                        <span
                        className={`
                            ml-auto inline-block py-0.5 px-2 text-xs font-semibold rounded-full
                            ${
                            isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }
                        `}
                        >
                        {item.badge}
                        </span>
                    )}
                    </button>
                );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center text-white font-semibold">
                        <Home className="w-5 h-5" />
                    </div>
                    </div>
                    <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-700">Our Home</p>
                    <p className="text-xs text-gray-500">2 members</p>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </aside>
    );
    };
