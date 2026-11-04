import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { ROUTES } from '../../constants/routes';
import { Clock, ShieldAlert, ArrowLeft } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check if seller application is still pending
  if (user.role === 'seller' && user.status === 'pending' && allowedRoles.includes('seller')) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Aapki Application Review Ke Liye Gayi Hai
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Your seller application has been submitted to the platform administration. Once approved, you will have complete access to list products and fulfill customer orders.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 mb-6 text-left text-xs text-slate-600 dark:text-slate-400 space-y-1.5 border border-slate-200/80 dark:border-slate-700/60">
            <div><span className="font-semibold text-slate-900 dark:text-slate-200">Registered Email:</span> {user.email}</div>
            <div><span className="font-semibold text-slate-900 dark:text-slate-200">Application Status:</span> <span className="text-amber-600 font-medium">Pending Admin Approval</span></div>
            <div><span className="font-semibold text-slate-900 dark:text-slate-200">Tip:</span> You can switch to the Admin persona using the demo switcher above to approve this account instantly.</div>
          </div>
          <a
            href={ROUTES.HOME}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </a>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            You do not have the required role permissions to view this portal.
          </p>
          <a
            href={ROUTES.HOME}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Return to Store
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
