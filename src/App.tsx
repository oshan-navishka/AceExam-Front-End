import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Exams from './pages/Exams';
import Notes from './pages/Notes';
import StudyPlans from './pages/StudyPlans';
import Papers from './pages/Papers';
import TakeExam from './pages/TakeExam';
import Results from './pages/Results';
import ResultDetail from './pages/ResultDetail';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — all wrapped in sidebar layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="exams" element={<Exams />} />
          <Route path="notes" element={<Notes />} />
          <Route path="study-plans" element={<StudyPlans />} />
          <Route path="papers" element={<Papers />} />
          <Route path="papers/:id/take" element={<TakeExam />} />
          <Route path="results" element={<Results />} />
          <Route path="results/:id" element={<ResultDetail />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
