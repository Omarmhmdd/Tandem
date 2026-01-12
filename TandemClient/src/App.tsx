import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HouseholdGuard } from './components/HouseholdGuard';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { HealthLogger } from './pages/HealthLogger';
import { Habits } from './pages/Habits';
import { Pantry } from './pages/Pantry';
import { MealPlanner } from './pages/MealPlanner';
import { Recipes } from './pages/Recipes';
import { Goals } from './pages/Goals';
import { Budget } from './pages/Budget';
import { MoodTimeline } from './pages/MoodTimeline';
import { DateNight } from './pages/DateNight';
import { Settings } from './pages/Settings';
import { HouseholdSetup } from './pages/HouseholdSetup';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes - require authentication */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <HouseholdGuard>
                <div className="min-h-screen bg-gray-50">
                  <Header />
                  <div className="flex">
                    <Sidebar />
                    <main className="flex-1 lg:ml-0">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/health" element={<HealthLogger />} />
                          <Route path="/habits" element={<Habits />} />
                          <Route path="/pantry" element={<Pantry />} />
                          <Route path="/meals" element={<MealPlanner />} />
                          <Route path="/recipes" element={<Recipes />} />
                          <Route path="/goals" element={<Goals />} />
                          <Route path="/budget" element={<Budget />} />
                          <Route path="/mood-timeline" element={<MoodTimeline />} />
                          <Route path="/date-night" element={<DateNight />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/householdsetup" element={<HouseholdSetup/>} />
                          <Route path="/household-setup" element={<HouseholdSetup/>} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </div>
                    </main>
                  </div>
                </div>
              </HouseholdGuard>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;