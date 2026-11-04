import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { ROUTES } from '../constants/routes';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#6C47FF] flex items-center justify-center mb-4">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
        Ye Page Nahi Mila (404)
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-6">
        Aap jis page ko dhoondh rahe hain wo mojood nahi hai ya relocate ho chuka hai.
      </p>
      <Link
        to={ROUTES.HOME}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Marketplace Home</span>
      </Link>
    </div>
  );
};
