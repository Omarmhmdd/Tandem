    import React from 'react';
    import { useNavigate } from 'react-router-dom';
    import { ShoppingBag, Target, Moon, UtensilsCrossed, Sparkles, Heart, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
    import { Button } from '../components/ui/Button';
    import { AINutritionCoach } from '../components/AINutritionCoach';
    import { Breadcrumbs } from '../components/ui/Breadcrumbs';
    import { useDashboardPage } from '../hooks/useDashboard';
    import { useAuth } from '../contexts/AuthContext';
    import type { LogEntry } from '../types/health.types';

    const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        });
    } catch {
        return dateString;
    }
    };

    const formatWeekStart = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        });
    } catch {
        return dateString;
    }
    };

    const getSleepDisplay = (log: LogEntry): string => {
    if (log.sleep?.hours) {
        return `${log.sleep.hours}h sleep`;
    }
    return 'No sleep data';
    };


    const getMoodDisplay = (log: LogEntry): string => {
    return log.mood ? `Mood: ${log.mood}` : '';
    };

    export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { pantryItems, expiringItems,totalGoals,completedGoals,recentLogs,avgSleep,thisWeekMeals,partnerName,latestSummary, } = useDashboardPage();

    return (
        <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-100">
            <h1 className="text-3xl font-bold mb-2 text-[#53389E]">
            Welcome back, {user?.firstName || 'there'}! 
            </h1>
            <p className="text-[#53389E]/80 text-lg font-medium">
            {partnerName 
                ? `Here's your and ${partnerName}'s wellness overview` 
                : "Here's your wellness overview"}
            </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card hover className="cursor-pointer" onClick={() => navigate('/pantry')}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">Pantry Items</p>
                    <p className="text-2xl font-bold text-gray-900">{pantryItems.length}</p>
                    {expiringItems.length > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                        {expiringItems.length} expiring soon
                    </p>
                    )}
                </div>
                <ShoppingBag className="w-10 h-10 text-brand-primary" />
                </div>
            </CardContent>
            </Card>

            <Card hover className="cursor-pointer" onClick={() => navigate('/goals')}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">Goals</p>
                    <p className="text-2xl font-bold text-gray-900">
                    {completedGoals}/{totalGoals}
                    </p>
                    <p className="text-xs text-green-600 mt-1">completed</p>
                </div>
                <Target className="w-10 h-10 text-green-500" />
                </div>
            </CardContent>
            </Card>

            <Card hover className="cursor-pointer" onClick={() => navigate('/health')}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Sleep</p>
                    <p className="text-2xl font-bold text-gray-900">{avgSleep}h</p>
                    <p className="text-xs text-blue-600 mt-1">last {recentLogs.length} logs</p>
                </div>
                <Moon className="w-10 h-10 text-blue-500" />
                </div>
            </CardContent>
            </Card>

            <Card hover className="cursor-pointer" onClick={() => navigate('/meals')}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">This Week Meals</p>
                    <p className="text-2xl font-bold text-gray-900">{thisWeekMeals}</p>
                    <p className="text-xs text-purple-600 mt-1">planned</p>
                </div>
                <UtensilsCrossed className="w-10 h-10 text-purple-500" />
                </div>
            </CardContent>
            </Card>
        </div>

        {/* AI Summary Card */}
        <Card className="border-2 border-brand-light bg-gradient-to-r from-white to-brand-light/10">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                Weekly AI Summary
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-3">
                {latestSummary ? (
                <>
                    <p className="text-lg font-semibold text-gray-900">
                    {latestSummary.highlight}
                    </p>
                    <ul className="space-y-2 text-gray-700">
                    {latestSummary.bullets && latestSummary.bullets.length > 0 ? (
                        latestSummary.bullets.map((bullet, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <span className="text-brand-primary mt-0.5">•</span>
                            <span>{bullet}</span>
                        </li>
                        ))
                    ) : (
                        <li className="text-gray-500 italic">No insights available for this week</li>
                    )}
                    </ul>
                    <div className="mt-4 p-4 bg-brand-primary/10 rounded-lg border border-brand-primary/20">
                    <p className="font-semibold text-brand-primary mb-1">🎯 Priority Action:</p>
                    <p className="text-gray-700">{latestSummary.action}</p>
                    </div>
                    {latestSummary.week_start && (
                    <p className="text-xs text-gray-500 mt-2">
                        Week of {formatWeekStart(latestSummary.week_start)}
                    </p>
                    )}
                </>
                ) : (
                <div className="text-center py-4">
                    <p className="text-gray-600 mb-2">No weekly summary available yet.</p>
                    <p className="text-sm text-gray-500">
                    Summaries are generated automatically every Monday. Check back soon!
                    </p>
                </div>
                )}
            </div>
            </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card hover className="cursor-pointer" onClick={() => navigate('/health')}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Health Logger</h3>
                    <p className="text-sm text-gray-600">Log your daily activities</p>
                </div>
                <Heart className="w-8 h-8 text-pink-500" />
                </div>
            </CardContent>
            </Card>

            <Card hover className="cursor-pointer" onClick={() => navigate('/meals')}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Meal Planner</h3>
                    <p className="text-sm text-gray-600">Plan your weekly meals</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
                </div>
            </CardContent>
            </Card>

            <Card hover className="cursor-pointer" onClick={() => navigate('/coach')}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-1">AI Coach</h3>
                    <p className="text-sm text-gray-600">Get personalized insights</p>
                </div>
                <MessageSquare className="w-8 h-8 text-brand-primary" />
                </div>
            </CardContent>
            </Card>
        </div>

        {/* AI Nutrition Coach */}
        <AINutritionCoach />

        {/* Recent Activity */}
        {recentLogs.length > 0 && (
            <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                <CardTitle>Recent Health Logs</CardTitle>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/health')} 
                    icon={ArrowRight}
                >
                    View All
                </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="font-medium text-gray-900">
                        {formatDate(log.date)}
                        </p>
                        <p className="text-sm text-gray-600">
                        {getSleepDisplay(log)} • {getMoodDisplay(log)}
                        </p>
                    </div>
                    </div>
                ))}
                </div>
            </CardContent>
            </Card>
        )}
        </div>
    );
    };