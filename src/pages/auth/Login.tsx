import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/slices/authSlice';
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconAlertTriangle,
  IconSparkles,
  IconGraduationCap,
  IconShieldCheck,
  IconTarget,
  IconArrowRight,
  IconCheckCircle
} from '../../components/common/Icons';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useAppSelector(s => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

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
    dispatch(loginUser(form));
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-900">
      {/* Left Column: Brand Showcase (Hidden on mobile, visible on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-r border-indigo-900/30 text-white">
        {/* Background glow effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

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

        {/* Feature Highlights Centerpiece */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <IconSparkles className="w-4 h-4 text-indigo-400" />
              Next-Gen Learning Intelligence
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Prepare smarter, <br />
              <span className="bg-gradient-to-r from-indigo-300 via-blue-300 to-teal-200 bg-clip-text text-transparent">
                score higher with AI.
              </span>
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              AceExam AI automates exam preparation by converting your course materials into custom practice tests, personalized study schedules, and intelligent feedback.
            </p>
          </div>

          {/* Value cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                <IconTarget className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Instant AI Practice Papers</h4>
                <p className="text-xs text-slate-400">Generate targeted practice questions with instant solutions & grading.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <IconShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Personalized Weakness Detection</h4>
                <p className="text-xs text-slate-400">Pinpoint knowledge gaps with AI diagnostic analysis before test day.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <IconCheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Used by ambitious university & high school students</span>
          </div>
          <span className="font-mono text-slate-500">v2.5 Pro</span>
        </div>
      </div>

      {/* Right Column: Authentication Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-slate-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header (Brand visible on mobile only) */}
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
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back
              </h2>
              <p className="text-sm text-slate-400">
                Sign in with your email to access your study hub.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-sm animate-shake">
                <IconAlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
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
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
                    placeholder="student@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IconLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-11 pr-11 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <IconEyeOff className="w-5 h-5" />
                    ) : (
                      <IconEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 active:scale-[0.99] shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm font-semibold tracking-wide"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <IconArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Register */}
            <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account yet?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/40 hover:decoration-indigo-400 transition-colors ml-1"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          {/* Privacy / Security Notice */}
          <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <IconShieldCheck className="w-4 h-4 text-slate-500" />
            <span>End-to-end encrypted session & secure token storage</span>
          </p>
        </div>
      </div>
    </div>
  );
}
