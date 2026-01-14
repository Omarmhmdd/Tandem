import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Activity, Moon, Heart, Target } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { PageHeader } from '../components/shared/PageHeader';
import { 
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency, formatPercentage, calculateAnalyticsDateRange, formatMonthlyBudget } from '../utils/analyticsHelpers';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  
  // Calculate date range using helper function
  const dateRange = useMemo(() => calculateAnalyticsDateRange(), []);

  const {
    weeklyData,
    monthlyMoodData,
    pantryWasteChartData,
    budgetCategoriesData,
    budgetSummary,
    goals,
    totalSteps,
    avgSleep,
    avgMood,
    goalsProgress,
    budgetChartDomain,
    isLoading,
  } = useAnalytics({
    timeRange, 
    weekStart: dateRange.weekStart,
    weekEnd: dateRange.weekEnd,
    monthStart: dateRange.monthStart,
    currentYear: dateRange.currentYear,
    currentMonth: dateRange.currentMonth,
  });


  // Format budget summary for display using helper function
  const monthlyBudget = useMemo(() => {
    return formatMonthlyBudget(budgetSummary?.budget?.monthly_budget);
  }, [budgetSummary?.budget?.monthly_budget]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Analytics' }]} />

      <PageHeader title="Analytics" description="View detailed insights and trends" />

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setTimeRange('week')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeRange === 'week'
              ? 'bg-[#53389E] text-white hover:bg-[#462d85] shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeRange === 'month'
              ? 'bg-[#53389E] text-white hover:bg-[#462d85] shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Month
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Card>
              <CardContent className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-2" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Combined Steps</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalSteps.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{timeRange === 'week' ? 'This week' : 'This month'}</p>
                  </div>
                  <Activity className="w-10 h-10 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Sleep</p>
                    <p className="text-2xl font-bold text-gray-900">{avgSleep}h</p>
                    <p className="text-xs text-gray-500 mt-1">{timeRange === 'week' ? 'This week' : 'This month'}</p>
                  </div>
                  <Moon className="w-10 h-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Mood</p>
                    <p className="text-2xl font-bold text-gray-900">{avgMood}/5</p>
                    <p className="text-xs text-gray-500 mt-1">{timeRange === 'week' ? 'This week' : 'This month'}</p>
                  </div>
                  <Heart className="w-10 h-10 text-pink-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Goals Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{goalsProgress}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {goals.length > 0
                        ? `${goals.length} goal${goals.length > 1 ? 's' : ''}`
                        : 'No goals'}
                    </p>
                  </div>
                  <Target className="w-10 h-10 text-brand-primary" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Steps Comparison - {timeRange === 'week' ? 'This Week' : 'This Month'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="me"
                      name="Me"
                      stroke="#53389E"
                      strokeWidth={2}
                      dot={{ fill: '#53389E', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="partner"
                      name="Partner"
                      stroke="#9E77ED"
                      strokeWidth={2}
                      dot={{ fill: '#9E77ED', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sleep & Mood Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis yAxisId="left" stroke="#6b7280" />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="sleep"
                      fill="#9E77ED"
                      name="Sleep (h)"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="mood"
                      fill="#D6BBFB"
                      name="Mood (/5)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Mood Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyMoodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="me"
                      name="Me"
                      stroke="#53389E"
                      strokeWidth={2}
                      dot={{ fill: '#53389E', r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="partner"
                      name="Partner"
                      stroke="#9E77ED"
                      strokeWidth={2}
                      dot={{ fill: '#9E77ED', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pantry Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {pantryWasteChartData && pantryWasteChartData.length > 0 && pantryWasteChartData.some(entry => entry.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pantryWasteChartData as unknown as Array<Record<string, unknown>>}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: { name?: string; percent?: number }) => {
                          const name = props.name || '';
                          const percent = props.percent;
                          return `${name}: ${formatPercentage(percent)}`;
                        }}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pantryWasteChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    <p>No pantry waste data available for this {timeRange === 'week' ? 'week' : 'month'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Budget Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={budgetCategoriesData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" stroke="#6b7280" />
                  <YAxis 
                    stroke="#6b7280" 
                    domain={[0, budgetChartDomain]}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                  <Legend />
                  {monthlyBudget && (
                    <ReferenceLine 
                      y={monthlyBudget}
                      stroke="#D6BBFB" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      label={{ 
                        value: `Monthly Budget: ${formatCurrency(monthlyBudget)}`,
                        position: 'top', 
                        fill: '#6b7280',
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                  <Bar
                    dataKey="amount"
                    fill="#53389E"
                    name="Spent"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
