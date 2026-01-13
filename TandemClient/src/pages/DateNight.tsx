import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Sparkles, UtensilsCrossed, Heart, Gift, DollarSign, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { PageHeader } from '../components/shared/PageHeader';
import { useDateNightPage } from '../hooks/useDateNight';
import { isValidDateNightBudget, getMinDateNightBudget, getMaxDateNightBudget } from '../utils/dateNightHelpers';

export const DateNight: React.FC = () => {
  const { budget, setBudget, suggestion, isLoading, isAccepting, generateSuggestion, acceptSuggestion } = useDateNightPage();

  const handleAccept = async () => {
    await acceptSuggestion();
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Date Night' }]} />
      
      <PageHeader
        title="Date Night Planner"
        description="AI-suggested date night based on your budget, mood, and pantry"
        action={{
          label: 'Get New Suggestion',
          onClick: generateSuggestion,
          icon: RefreshCw,
        }}
      />

      {/* Budget Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand-primary" />
            Set Your Date Night Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How much do you want to spend on this date night?
              </label>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">$</span>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  min={getMinDateNightBudget().toString()}
                  max={getMaxDateNightBudget().toString()}
                  step="5"
                  className="flex-1 max-w-xs"
                  placeholder="50"
                />
                <span className="text-sm text-gray-500">USD</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 The AI will plan your meal, activity, and treat based on this budget
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={generateSuggestion}
              disabled={isLoading || !isValidDateNightBudget(budget)}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Generating...' : 'Generate Suggestion'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="w-12 h-12 text-brand-primary mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Analyzing your budget, moods, and pantry...</p>
          </CardContent>
        </Card>
      ) : suggestion ? (
        <>
          {/* Total Cost */}
          <Card className={`border-2 ${suggestion.status === 'accepted' ? 'border-green-500 bg-green-50' : 'border-brand-primary bg-gradient-to-r from-brand-primary/5 to-brand-light/10'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                  <p className="text-3xl font-bold text-gray-900">${suggestion.totalCost}</p>
                  {suggestion.status === 'accepted' ? (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Accepted! Meal added to meal plan
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 mt-1">Affordable and romantic!</p>
                  )}
                </div>
                <DollarSign className="w-16 h-16 text-brand-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                Why This Date Night?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{suggestion.reasoning}</p>
            </CardContent>
          </Card>

          {/* Meal Suggestion */}
          <Card hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                Suggested Meal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{suggestion.meal.name}</h3>
                <p className="text-gray-600 mb-3">{suggestion.meal.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">${suggestion.meal.cost}</span>
                  {suggestion.status === 'accepted' ? (
                    <Button variant="primary" disabled className="opacity-50">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Added to Meal Plan
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={handleAccept} disabled={isAccepting}>
                      {isAccepting ? 'Adding...' : 'Add to Meal Plan'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Suggestion */}
          <Card hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Suggested Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{suggestion.activity.name}</h3>
                <p className="text-gray-600 mb-2">{suggestion.activity.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Duration: {suggestion.activity.duration}</span>
                  <span className="text-lg font-bold text-gray-900">${suggestion.activity.cost}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treat Suggestion */}
          <Card hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-500" />
                Suggested Treat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{suggestion.treat.name}</h3>
                <p className="text-gray-600 mb-3">{suggestion.treat.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">${suggestion.treat.cost}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-3">
                {suggestion.status === 'accepted' ? (
                  <Button variant="primary" className="flex-1" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accepted ✓
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    className="flex-1" 
                    onClick={handleAccept}
                    disabled={isAccepting}
                  >
                    {isAccepting ? 'Accepting...' : 'Accept All Suggestions'}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={generateSuggestion}
                  disabled={isLoading || isAccepting}
                >
                  Get Different Suggestion
                </Button>
              </div>
            </CardContent>
          </Card>

        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Click "Get New Suggestion" to generate a date night plan!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
