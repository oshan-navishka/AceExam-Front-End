import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearError } from '../../store/slices/authSlice';
import {
  IconMail,
  IconLock,
  IconUser,
  IconEye,
  IconEyeOff,
  IconAlertTriangle,
  IconSparkles,
  IconGraduationCap,
  IconShieldCheck,
  IconCheck,
  IconArrowRight,
  IconBrain
} from '../../components/common/Icons';

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useAppSelector(s => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setLocalError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    setLocalError('');
    dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
  };

  const passwordsMatch = form.password && form.confirm && form.password === form.confirm;

  return (
    <div className="min-h-screen w-full flex bg-slate-900">
      {/* Left Column: Brand Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-r border-indigo-900/30 text-white">
        {/* Ambient background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center">
                <IconGraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                AceExam AI
              </span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                AI Powered
              </span>
            </div>
          </div>
        </div>

        {/* Value Pitch */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <IconSparkles className="w-4 h-4 text-indigo-400" />
              Elevate Your Grades in Weeks
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Create your account & <br />
              <span className="bg-gradient-to-r from-indigo-300 via-blue-300 to-teal-200 bg-clip-text text-transparent">
                unlock AI study power.
              </span>
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Join thousands of high-achieving students who rely on AceExam AI to streamline notes, practice exam papers, and stay ahead of test schedules.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <IconCheck className="w-3.5 h-3.5" />
              </div>
              <span>Upload PDF lecture notes & extract high-yield questions</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <IconCheck className="w-3.5 h-3.5" />
              </div>
              <span>Automated timed mock exam sessions with instant scoring</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <IconCheck className="w-3.5 h-3.5" />
              </div>
              <span>Personalized Gemini AI study plans tailored to exam dates</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <IconBrain className="w-4 h-4 text-indigo-400" />
            <span>Powered by advanced Gemini AI models</span>
          </div>
          <span className="font-mono text-slate-500">v2.5 Pro</span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-slate-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-xl shadow-indigo-500/25 p-0.5 mb-2">
              <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center">
                <IconGraduationCap className="w-7 h-7 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">AceExam AI</h2>
            <p className="text-xs text-slate-400">Smart Exam Preparation Platform</p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative">
            <div className="space-y-2 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Create account
              </h2>
              <p className="text-sm text-slate-400">
                Sign up in seconds to start generating study materials.
              </p>
            </div>

            {(error || localError) && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-sm">
                <IconAlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{localError || error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IconUser className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Alex Morgan"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IconMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="alex@university.edu"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IconLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-11 pr-11 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                  >
                    {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Confirm Password
                  </label>
                  {passwordsMatch && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <IconCheck className="w-3.5 h-3.5" /> Matches
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IconLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="w-full pl-11 pr-11 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                  >
                    {showConfirm ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 active:scale-[0.99] shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm font-semibold tracking-wide"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <IconArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/40 hover:decoration-indigo-400 transition-colors ml-1"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <IconShieldCheck className="w-4 h-4 text-slate-500" />
            <span>Secure account creation with instant activation</span>
          </p>
        </div>
      </div>
    </div>
  );
}
