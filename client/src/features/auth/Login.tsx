import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../app/providers/AuthProvider';
import { useNavigate, Navigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['EMPLOYEE', 'DIRECTOR', 'ACCOUNTS'])
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: 'EMPLOYEE' }
  });

  if (isAuthenticated && user) {
    // Redirect based on role
    if (user.role === 'EMPLOYEE') return <Navigate to="/employee/dashboard" replace />;
    if (user.role === 'DIRECTOR') return <Navigate to="/director/dashboard" replace />;
    if (user.role === 'ACCOUNTS') return <Navigate to="/accounts/dashboard" replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      await login(data.email, data.password, data.role);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left: Brand */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white hidden md:block"
        >
          <h1 className="text-4xl font-bold mb-4 font-['Plus_Jakarta_Sans']">ExpenseManager</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Streamline your voucher submissions and approvals with our next-generation digital workflow.
          </p>
        </motion.div>

        {/* Right: Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass p-8 w-full max-w-md mx-auto relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/5 pointer-events-none" />
          
          <h2 className="text-2xl font-semibold mb-6 text-white font-['Plus_Jakarta_Sans']">Sign In</h2>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[var(--danger)]/20 border border-[var(--danger)]/50 text-[var(--danger)] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
              <select 
                {...register('role')}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--accent-primary)] transition-colors appearance-none [&>option]:bg-[#1a1b26]"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="DIRECTOR">Director</option>
                <option value="ACCOUNTS">Accounts</option>
              </select>
              {errors.role && <p className="text-[var(--danger)] text-xs mt-1">{errors.role.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
              <input 
                {...register('email')}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-[var(--danger)] text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
              <input 
                {...register('password')}
                type="password"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-[var(--danger)] text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[var(--accent-primary)] hover:bg-[#3d70cc] text-white font-medium py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials Helper */}
          <div className="mt-8 pt-4 border-t border-white/10">
            <details className="text-sm text-[var(--text-secondary)] cursor-pointer">
              <summary className="hover:text-white transition-colors">Demo Credentials</summary>
              <ul className="mt-2 space-y-1 text-xs">
                <li>Employee: employee1@abc.com</li>
                <li>Director: director@abc.com</li>
                <li>Accounts: accounts@abc.com</li>
                <li className="pt-1 text-white/40">Password for all: Password@123</li>
              </ul>
            </details>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
