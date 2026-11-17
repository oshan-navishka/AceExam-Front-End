import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearError } from '../../store/slices/authSlice';

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useAppSelector(s => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [localError, setLocalError] = useState('');

  useEffect(() => { if (token) navigate('/dashboard'); }, [token, navigate]);
  useEffect(() => { return () => { dispatch(clearError()); }; }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setLocalError('Passwords do not match'); return; }
    if (form.password.length < 6) { setLocalError('Password must be at least 6 characters'); return; }
    setLocalError('');
    dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-white">AceExam AI</h1>
          <p className="text-primary-200 mt-1">Start your AI-powered study journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create account</h2>
          <p className="text-gray-500 text-sm mb-6">Join thousands of students acing their exams</p>

          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 text-base flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><span className="spinner w-4 h-4" />Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
