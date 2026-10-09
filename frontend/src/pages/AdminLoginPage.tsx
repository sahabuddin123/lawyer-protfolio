import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { SeoHead } from '@/components/seo/SeoHead';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Scale,
  ArrowLeft,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine redirection target (fallback to /admin/cms)
  const redirectTarget = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin/cms';

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your administrative email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: email.trim(), password });
      navigate(redirectTarget, { replace: true });
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Authentication failed. Please verify your administrative credentials.';
      setErrorMessage(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <SeoHead
        title="Admin Portal Login — Advocate Nijam Uddin"
        description="Secure judicial administration login portal for Advocate Nijam Uddin platform."
        robots="noindex, nofollow"
      />

      {/* Top Bar Navigation */}
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-neutral-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO PUBLIC CHAMBER SITE</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
          <span className="w-2 h-2 rounded-full bg-amber-500/80 animate-pulse" />
          <span>JUDICIAL CMS SECURITY GATEWAY</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <Container size="prose" className="w-full max-w-md my-auto">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl shadow-2xl p-8 backdrop-blur-sm relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700" />

          {/* Chamber Header & Crest */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-neutral-950 border border-amber-500/30 text-amber-400 shadow-inner">
              <Scale className="w-7 h-7 stroke-[1.75]" />
            </div>
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400 block mb-1">
                Back-Office Portal Access
              </span>
              <h1 className="text-2xl font-serif text-white tracking-wide">
                Chamber Administration
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Advocate Nijam Uddin • Supreme Court of Bangladesh
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-3.5 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <Input
                id="admin-email"
                type="email"
                label="Administrator Email"
                required
                autoComplete="username"
                autoFocus
                placeholder="admin@nijamuddin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  label="Secure Password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-400 hover:text-neutral-200 transition-colors pointer-events-auto"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold tracking-wide border-0 shadow-lg"
                disabled={isSubmitting}
                rightIcon={
                  isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )
                }
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
              </Button>
            </div>
          </form>

          {/* Security Notice Footnote */}
          <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500/70" />
              <span>TLS 1.3 Encrypted Session • Audit Logged</span>
            </div>
            <p className="text-[10px] text-neutral-600 mt-2 leading-relaxed">
              Restricted to authorized chambers personnel. All login attempts, IP addresses, and timestamps are audited.
            </p>
          </div>
        </div>
      </Container>

      {/* Footer Legal Notice */}
      <div className="w-full max-w-6xl mx-auto text-center pt-8 text-[11px] text-neutral-600 font-mono">
        © {new Date().getFullYear()} Advocate Nijam Uddin Chambers. All Rights Reserved.
      </div>
    </div>
  );
};
