import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  CheckCircle,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('admin@sgtu.edu');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(identifier, password);
      const role = data.user.role;

      // Redirect based on role
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'TEACHER') navigate('/teacher/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Invalid credentials. Please verify your email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-page dark:bg-navy-950 transition-colors">
      {/* Left Banner - SG Tech University Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-slate-900 to-navy-950 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3.5 z-10">
          {/* Logo Monogram: SG */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 via-indigo-600 to-accent-purple flex items-center justify-center shadow-lg shadow-brand-500/35 ring-4 ring-white/10">
            <span className="font-black text-white text-xl tracking-wider">SG</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>SG TECH UNIVERSITY</span>
            </h1>
            <p className="text-xs text-brand-300 font-semibold tracking-wide uppercase">
              Smart Generation • SGTU
            </p>
          </div>
        </div>

        {/* Center Slogans & Value Propositions */}
        <div className="z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-brand-200 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Innovate Today. Lead Tomorrow.</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight">
              Empowering Minds, Engineering Futures.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Innovative, prestigious, and future-ready higher education management ecosystem designed for the next generation of academic leaders.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-sm text-slate-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-tier Role Based Governance (Super Admin, Faculty, Student, Accounts)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real-time Interactive Attendance, Submissions & Letter Grading</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Digitally Verified Receipts, Invoices & Comprehensive Audit Trails</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-400" />
            <span>Tech Campus • NAAC A++ Accredited • Smart Generation</span>
          </div>
          <span className="font-mono text-slate-400 font-medium">SGTU v1.0.0</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white dark:bg-navy-950">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-left">
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-purple flex items-center justify-center text-white font-black text-lg shadow-md shadow-brand-500/25">
                SG
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white block leading-tight">
                  SG Tech University
                </span>
                <span className="text-[11px] text-brand-600 font-bold uppercase tracking-wider">
                  Smart Generation (SGTU)
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sign in to Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Enter your SGTU university email or College Registration ID.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email / College Registration ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@sgtu.edu or SGTU-2023-CS01"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('For password resets, contact the registrar at admin@sgtu.edu or use your development credentials.')}
                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold shadow-md shadow-brand-500/25 py-3"
            >
              Sign In to SGTU Portal
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-200 dark:border-navy-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>One-Click Demo Credentials</span>
              <span className="text-[10px] text-brand-600 font-semibold lowercase">click to autofill</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@sgtu.edu', 'Admin@123')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-navy-800 text-left transition-all hover:border-brand-300"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">Admin</div>
                <div className="text-[10px] text-slate-400 font-mono">admin@sgtu.edu</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('prof.sharma@sgtu.edu', 'Teacher@123')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-navy-800 text-left transition-all hover:border-brand-300"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">Faculty (HOD)</div>
                <div className="text-[10px] text-slate-400 font-mono">prof.sharma@sgtu.edu</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('arjun.kumar@sgtu.edu', 'Student@123')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-navy-800 text-left transition-all hover:border-brand-300"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">Student (Arjun)</div>
                <div className="text-[10px] text-slate-400 font-mono">arjun.kumar@sgtu.edu</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('accountant@sgtu.edu', 'Accountant@123')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-navy-800 text-left transition-all hover:border-brand-300"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">Accountant</div>
                <div className="text-[10px] text-slate-400 font-mono">accountant@sgtu.edu</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
