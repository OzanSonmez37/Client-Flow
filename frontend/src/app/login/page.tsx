'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(1, 'Şifre gerekli'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data as { email: string; password: string });
      setAuth(res.data.user, res.data.access_token);
      document.cookie = 'auth_present=true;path=/;max-age=604800';
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg[0]);
      } else {
        setError(msg || 'Giriş başarısız. E-posta veya şifre hatalı.');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Decorative circles */}
        <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-1/4 left-0 w-56 h-56 rounded-full bg-brand-400/20 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">ClientFlow</h1>
          <p className="text-brand-200 text-lg max-w-xs mx-auto leading-relaxed">
            Müşteri ve proje yönetimini tek bir panelden takip edin
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { n: '∞', l: 'Sınırsız müşteri' },
              { n: '—', l: 'Gerçek zamanlı takip' },
              { n: '4', l: 'Proje durumu' },
              { n: '📊', l: 'Detaylı analitik' },
            ].map((item) => (
              <div key={item.l} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white text-xl font-bold">{item.n}</p>
                <p className="text-brand-200 text-sm mt-0.5">{item.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-xl text-ink">ClientFlow</span>
            </div>
            <h2 className="text-2xl font-bold text-ink">Hoş geldiniz</h2>
            <p className="text-ink-muted mt-1">Hesabınıza giriş yapın</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">E-posta</label>
              <input
                {...register('email')}
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="ornek@sirket.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Şifre</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink-muted"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center py-2.5 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-surface-50 rounded-lg border border-surface-200">
            <p className="text-xs font-medium text-ink-muted mb-2">Demo hesaplar:</p>
            <div className="space-y-1 text-xs text-ink-muted font-mono">
              <p>admin@demo.com / demo1234 (Admin)</p>
              <p>manager@demo.com / demo1234 (Manager)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
