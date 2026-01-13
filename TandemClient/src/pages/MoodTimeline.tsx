import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Calendar, Heart, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { PageHeader } from '../components/shared/PageHeader';
import { useMoodTimelinePage } from '../hooks/useMoodTimeline';
import { getMoodEmoji } from '../utils/moodHelpers';

export const MoodTimeline: React.FC = () => {
  const {
    moods,
    annotations,
    timeRange,
    setTimeRange,
    chartData,
    youAvg,
    partnerAvg,
    groupedMoods,
    timelineDates,
  } = useMoodTimelinePage();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Mood Timeline' }]} />

      <PageHeader
        title="Shared Mood Timeline"
        description="Track your moods together with event annotations"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Avg Mood</p>
                <p className="text-2xl font-bold text-gray-900">{youAvg}/5</p>
              </div>
              <Heart className="w-10 h-10 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Partner's Avg Mood</p>
                <p className="text-2xl font-bold text-gray-900">{partnerAvg}/5</p>
              </div>
              <Heart className="w-10 h-10 text-brand-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                tickFormatter={(date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6b7280" domain={[1, 5]} />
              <Tooltip 
                labelFormatter={(date: string) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="you"
                name="You"
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

      {/* Timeline View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Timeline</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeRange === 'week'
                    ? 'bg-[#53389E] text-white hover:bg-[#462d85] shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeRange === 'month'
                    ? 'bg-[#53389E] text-white hover:bg-[#462d85] shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timelineDates.map((date) => {
                const dayMoods = groupedMoods[date] || [];
                const dayAnnotations = annotations.filter(a => a.date === date);
                
                return (
                  <div key={date} className="border-l-2 border-brand-light pl-4 pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Annotations */}
                    {dayAnnotations.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {dayAnnotations.map(ann => (
                          <div
                            key={ann.id}
                            className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900">{ann.title}</p>
                              <p className="text-xs text-blue-700">{ann.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Moods */}
                    {dayMoods.length > 0 && (
                      <div className="space-y-2">
                        {dayMoods.map(mood => (
                          <div
                            key={mood.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-2xl">{getMoodEmoji(mood.mood)}</span>
                              <div>
                                <p className="font-medium text-gray-900">{mood.userName}</p>
                                <p className="text-sm text-gray-600 capitalize">{mood.mood}</p>
                              </div>
                            </div>
                            {mood.notes && (
                              <p className="text-sm text-gray-600 italic">{mood.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {timelineDates.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No mood entries or annotations yet. Start tracking your moods!</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
