    import React, { useState, useMemo } from 'react';
    import { HealthLogger as HealthLoggerComponent } from '../components/HealthLogger';
    import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
    import { Button } from '../components/ui/Button';
    import { ConfirmDialog } from '../components/ui/ConfirmDialog';
    import { Breadcrumbs } from '../components/ui/Breadcrumbs';
    import { EmptyState } from '../components/ui/EmptyState';
    import { PageHeader } from '../components/shared/PageHeader';
    import { Calendar, Clock, Activity, Coffee, Moon, Trash2, FileText, ChevronDown } from 'lucide-react';
    import { useHealthPage } from '../hooks/useHealth';
    import { useConfirmDialog } from '../hooks/useConfirmDialog';
    import type { LogEntry } from '../types/health.types';

    const INITIAL_ENTRIES_TO_SHOW = 10;

    export const HealthLogger: React.FC = () => {
    const {
        entries,
        avgSleep,
        totalActivities,
        totalFoodItems,
        saveEntry,
        deleteEntry,
        getMoodEmoji,
    } = useHealthPage();

    const [showAll, setShowAll] = useState(false);
    const deleteConfirm = useConfirmDialog();

    const displayedEntries = useMemo(() => {
        return showAll ? entries : entries.slice(0, INITIAL_ENTRIES_TO_SHOW);
    }, [entries, showAll]);

    const hasMoreEntries = entries.length > INITIAL_ENTRIES_TO_SHOW;

    const handleSaveEntry = async (entry: Omit<LogEntry, 'id'>) => {
        await saveEntry(entry);
    };

    const handleDelete = (id: string) => {
        deleteConfirm.open(id);
    };

    const handleConfirmDelete = () => {
        deleteConfirm.confirm((id) => {
        deleteEntry(id);
        });
    };

    return (
        <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Health Logger' }]} />

        <PageHeader title="Health Logger" description="Track your daily health and habits" />

        {/* Quick Log */}
        <HealthLoggerComponent onSave={handleSaveEntry} />

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">Avg Sleep</p>
                    <p className="text-2xl font-bold text-gray-900">{avgSleep}h</p>
                </div>
                <Moon className="w-8 h-8 text-blue-500" />
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">Total Activities</p>
                    <p className="text-2xl font-bold text-gray-900">{totalActivities}</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">Entries</p>
                    <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-brand-primary" />
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">Food Items</p>
                    <p className="text-2xl font-bold text-gray-900">{totalFoodItems}</p>
                </div>
                <Coffee className="w-8 h-8 text-orange-500" />
                </div>
            </CardContent>
            </Card>
        </div>

        {/* All Entries */}
        <Card>
            <CardHeader>
            <CardTitle>All Entries {entries.length > 0 && `(${entries.length})`}</CardTitle>
            </CardHeader>
            <CardContent>
            {entries.length === 0 ? (
                <EmptyState
                icon={FileText}
                title="No health log entries yet"
                description="Start logging your daily activities, food, sleep, and mood to track your wellness journey."
                />
            ) : (
                <>
                <div className="space-y-4">
                {displayedEntries.map((entry: LogEntry) => (
                    <div
                    key={entry.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-brand-light hover:shadow-sm transition-all"
                    >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="font-semibold text-gray-900">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                            })}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {entry.time}
                            </p>
                        </div>
                        </div>

                        <div className="flex items-center gap-2">
                        <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                        <span className="px-2 py-1 bg-brand-light/30 text-brand-primary rounded text-xs font-medium capitalize">
                            {entry.mood}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            icon={Trash2}
                        >
                            Delete
                        </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        {entry.sleep && (
                        <div className="flex items-start gap-2">
                            <Moon className="w-4 h-4 text-blue-500 mt-0.5" />
                            <div>
                            <p className="text-sm font-medium text-gray-900">{entry.sleep.hours}h sleep</p>
                            {entry.sleep.bedtime && (
                                <p className="text-xs text-gray-500">
                                {entry.sleep.bedtime} - {entry.sleep.wakeTime}
                                </p>
                            )}
                            </div>
                        </div>
                        )}

                        {entry.activities.length > 0 && (
                        <div className="flex items-start gap-2">
                            <Activity className="w-4 h-4 text-green-500 mt-0.5" />
                            <div>
                            <p className="text-sm font-medium text-gray-900">Activities</p>
                            <p className="text-xs text-gray-600">{entry.activities.join(', ')}</p>
                            </div>
                        </div>
                        )}

                        {entry.food.length > 0 && (
                        <div className="flex items-start gap-2">
                            <Coffee className="w-4 h-4 text-orange-500 mt-0.5" />
                            <div>
                            <p className="text-sm font-medium text-gray-900">Food & Drinks</p>
                            <p className="text-xs text-gray-600">{entry.food.join(', ')}</p>
                            </div>
                        </div>
                        )}
                    </div>

                    {entry.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-700">{entry.notes}</p>
                        </div>
                    )}
                    </div>
                ))}
                </div>
                
                {hasMoreEntries && (
                    <div className="mt-6 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => setShowAll(!showAll)}
                        icon={ChevronDown}
                    >
                        {showAll 
                        ? `Show Less` 
                        : `View All (${entries.length - INITIAL_ENTRIES_TO_SHOW} more)`}
                    </Button>
                    </div>
                )}
                </>
            )}
            </CardContent>
        </Card>

        <ConfirmDialog
            isOpen={deleteConfirm.isOpen}
            onClose={deleteConfirm.close}
            onConfirm={handleConfirmDelete}
            title="Delete Entry"
            message="Are you sure you want to delete this health log entry? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
        />
        </div>
    );
    };