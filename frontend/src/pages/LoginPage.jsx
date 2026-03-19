import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password);
        setSuccessMsg('Account created! You can now log in.');
        setIsSignup(false);
        setPassword('');
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      const apiError = err.response?.data?.detail;
      if (Array.isArray(apiError)) {
        setError(apiError.map(e => e.msg).join(', '));
      } else if (typeof apiError === 'string') {
        setError(apiError);
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-red/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-amber/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-red/15 flex items-center justify-center border border-accent-red/20 shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-red">
                <path d="M12 2l4.5 4-1.5 12h-6L7.5 6z" />
                <path d="M12 22V10" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">
            REDTEAM <span className="text-accent-red">AI</span>
          </h1>
          <p className="text-sm text-text-muted mt-2">
            LLM Red-Teaming Assistant
          </p>
        </div>

        {/* Login panel */}
        <div className="panel glow-red">
          <div className="panel-header">
            <div className="flex items-center gap-3">
              <div className="traffic-lights">
                <div className="traffic-dot red" />
                <div className="traffic-dot amber" />
                <div className="traffic-dot green" />
              </div>
              <span className="text-xs text-text-muted font-mono">
                {isSignup ? 'create_account' : 'authenticate'}
              </span>
            </div>
          </div>

          <div className="panel-body">
            {/* Tab switcher */}
            <div className="flex mb-6 bg-black/30 shadow-inner backdrop-blur-sm rounded-xl p-1">
              <button
                type="button"
                onClick={() => { setIsSignup(false); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  !isSignup
                    ? 'bg-bg-surface text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignup(true); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  isSignup
                    ? 'bg-bg-surface text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error / Success messages */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-accent-red/10 border border-accent-red/20">
                <p className="text-xs text-accent-red">{error}</p>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-accent-green/10 border border-accent-green/20">
                <p className="text-xs text-accent-green">{successMsg}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1.5 block">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="researcher@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {isSignup && (
                  <p className={`text-[10px] mt-1.5 transition-colors ${
                    password.length >= 8 && 
                    /[A-Z]/.test(password) && 
                    /[a-z]/.test(password) && 
                    /\d/.test(password)
                      ? 'text-accent-green'
                      : 'text-text-muted'
                  }`}>
                    Min 8 chars, 1 uppercase, 1 lowercase, 1 number
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    <span>{isSignup ? 'Creating...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          Powered by MITRE ATLAS & OWASP Top 10 for LLMs
        </p>
      </div>
    </div>
  );
}
