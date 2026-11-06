import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, ArrowRight, ShieldCheck, Store, UserCheck, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants/routes';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const routeByRole = (role: string) => {
    if (redirectPath) {
      navigate(redirectPath);
      return;
    }
    if (role === 'admin') navigate(ROUTES.ADMIN_DASHBOARD);
    else if (role === 'seller') navigate(ROUTES.SELLER_DASHBOARD);
    else navigate(ROUTES.HOME);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const profile = await authService.signInWithPassword(email.trim(), password);
      setUser(profile);
      routeByRole(profile.role);
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const profile = await authService.signInWithGoogle();
      setUser(profile);
      routeByRole(profile.role);
    } catch (err: any) {
      setError(err?.message || 'Google sign-in error');
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemoAccount = async (demoEmail: string) => {
    setError('');
    setIsLoading(true);
    try {
      const profile = await authService.signInWithPassword(demoEmail);
      setUser(profile);
      routeByRole(profile.role);
    } catch (err: any) {
      setError(err?.message || 'Failed demo login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <Link to={ROUTES.HOME} className="text-2xl font-extrabold text-[#6C47FF] font-display">
            ZENVO
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white pt-2">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-slate-500">
            Welcome back! Enter your credentials to access your dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl text-xs font-medium flex items-center gap-2 border border-red-200 dark:border-red-900/40">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Quick Credentials Banner */}
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-[#6C47FF] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Panel Credentials
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin');
                setPassword('admin123@#');
              }}
              className="text-[11px] font-bold text-[#6C47FF] hover:underline cursor-pointer bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-xs"
            >
              Autofill
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400">Username:</span> <code className="font-bold text-slate-800 dark:text-slate-100">admin</code>
            </div>
            <div>
              <span className="text-slate-400">Email:</span> <code className="font-bold text-slate-800 dark:text-slate-100">admin@zenvo.com</code>
            </div>
            <div>
              <span className="text-slate-400">Password:</span> <code className="font-bold text-slate-800 dark:text-slate-100">admin123@#</code>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Username or Email Address
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin or name@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-xs text-[#6C47FF] hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123@# or your password"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* 1-Click Instant Demo Persona Logins */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Instant Demo Logins (No Password Needed)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => loginDemoAccount('customer@zenvo.com')}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-center transition-colors border border-slate-200/70 dark:border-slate-700"
            >
              <UserCheck className="w-4 h-4 mx-auto text-[#6C47FF] mb-1" />
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Customer</div>
              <div className="text-[9px] text-slate-400">Bilal Khan</div>
            </button>

            <button
              type="button"
              onClick={() => loginDemoAccount('seller@zenvo.com')}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-center transition-colors border border-slate-200/70 dark:border-slate-700"
            >
              <Store className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Seller</div>
              <div className="text-[9px] text-slate-400">Tariq Crafts</div>
            </button>

            <button
              type="button"
              onClick={() => loginDemoAccount('admin@zenvo.com')}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-center transition-colors border border-slate-200/70 dark:border-slate-700"
            >
              <ShieldCheck className="w-4 h-4 mx-auto text-blue-600 mb-1" />
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Admin</div>
              <div className="text-[9px] text-slate-400">Hamza Malik</div>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Naya account banana chahte hain?{' '}
          <Link to={ROUTES.SIGNUP} className="font-bold text-[#6C47FF] hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};
