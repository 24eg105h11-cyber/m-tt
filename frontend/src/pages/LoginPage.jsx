import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Sparkles, Lock, Mail, Shield, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await authApi.login(data);
      setAuth(res.data.user, res.data.token);

      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (res.data.user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (res.data.user.role === 'FACULTY') {
        navigate('/faculty/book', { replace: true });
      } else {
        navigate('/timetable', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    onSubmit({ email, password });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to PredictSpace</h2>
          <p className="text-xs text-slate-400">
            Access intelligent classroom allocation & prediction services
          </p>
        </div>

        {/* Quick Demo Logins Box */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            Instant Demo Logins (Click to Sign In):
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@campus.edu', 'Admin@123')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-center transition group"
            >
              <Shield className="w-4 h-4 text-indigo-400 mx-auto mb-1 group-hover:scale-110 transition" />
              <div className="text-xs font-bold text-white">Admin</div>
              <div className="text-[9px] text-slate-500">Facilities</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('dr.alan@campus.edu', 'Faculty@123')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-center transition group"
            >
              <BookOpen className="w-4 h-4 text-emerald-400 mx-auto mb-1 group-hover:scale-110 transition" />
              <div className="text-xs font-bold text-white">Faculty</div>
              <div className="text-[9px] text-slate-500">CS Dept</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('student@campus.edu', 'Student@123')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-center transition group"
            >
              <GraduationCap className="w-4 h-4 text-amber-400 mx-auto mb-1 group-hover:scale-110 transition" />
              <div className="text-xs font-bold text-white">Student</div>
              <div className="text-[9px] text-slate-500">Alex M.</div>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@campus.edu"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an institutional account?{' '}
            <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
