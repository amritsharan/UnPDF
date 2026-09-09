import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileKey, Lock, Mail, User as UserIcon, Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck, Cpu, Zap, History } from 'lucide-react';

export const AuthGuard: React.FC = () => {
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          setError('Please fill in both email and password.');
          setIsSubmitting(false);
          return;
        }

        const res = login(email, password);
        if (!res.success) {
          setError(res.message || 'Login failed.');
        }
      } else {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        if (!email.trim()) {
          setError('Please enter a valid email address.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }

        const res = signup(name, email, password);
        if (!res.success) {
          setError(res.message || 'Sign up failed.');
        }
      }

      setIsSubmitting(false);
    }, 300);
  };

  const handleFillDemo = () => {
    setMode('login');
    setEmail('demo@unpdf.app');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="auth-guard-screen" id="auth-guard-screen">
      <div className="auth-guard-container">
        {/* Top Branding Hero */}
        <div className="auth-guard-hero">
          <div className="logo-container" id="guard-app-logo">
            <FileKey className="logo-icon" aria-hidden="true" />
          </div>
          <h1 className="app-title" id="guard-app-title">UnPDF</h1>
          <p className="app-subtitle" id="guard-app-subtitle">
            Instantly remove password protection and restrictions from your PDF files. 
            Sign in to unlock the PDF tools dashboard.
          </p>
        </div>

        {/* Auth Form Box */}
        <div className="auth-guard-card" id="auth-guard-card">
          <div className="auth-header-icon" id="auth-guard-badge">
            <ShieldCheck size={28} />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="auth-tabs" id="guard-auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(null); }}
              id="guard-tab-btn-login"
            >
              Log In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setError(null); }}
              id="guard-tab-btn-signup"
            >
              Sign Up
            </button>
          </div>

          <div className="auth-modal-body">
            <h2 className="auth-title" id="guard-auth-title">
              {mode === 'login' ? 'Log in to UnPDF' : 'Create Free Account'}
            </h2>
            <p className="auth-subtitle" id="guard-auth-desc">
              {mode === 'login'
                ? 'Enter your credentials to access the offline PDF decryptor.'
                : 'Create an account to unlock PDFs and save history.'}
            </p>

            {error && (
              <div className="auth-error-banner" id="guard-auth-error">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" id="guard-main-form">
              {mode === 'signup' && (
                <div className="form-group" id="guard-group-name">
                  <label className="form-label" htmlFor="guard-input-name">Full Name</label>
                  <div className="input-with-icon">
                    <UserIcon className="field-icon" size={18} />
                    <input
                      id="guard-input-name"
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group" id="guard-group-email">
                <label className="form-label" htmlFor="guard-input-email">Email Address</label>
                <div className="input-with-icon">
                  <Mail className="field-icon" size={18} />
                  <input
                    id="guard-input-email"
                    type="email"
                    className="auth-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" id="guard-group-password">
                <label className="form-label" htmlFor="guard-input-password">Password</label>
                <div className="input-with-icon">
                  <Lock className="field-icon" size={18} />
                  <input
                    id="guard-input-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    id="guard-btn-toggle-password"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="form-group" id="guard-group-confirm-password">
                  <label className="form-label" htmlFor="guard-input-confirm-password">Confirm Password</label>
                  <div className="input-with-icon">
                    <Lock className="field-icon" size={18} />
                    <input
                      id="guard-input-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn btn-action btn-primary"
                disabled={isSubmitting}
                id="guard-btn-submit"
              >
                {isSubmitting ? (
                  <span className="spinner"></span>
                ) : mode === 'login' ? (
                  'Log In to Continue'
                ) : (
                  'Create Free Account'
                )}
              </button>
            </form>

            <div className="demo-login-divider">
              <span>Quick Demo Access</span>
            </div>

            <button
              type="button"
              className="demo-account-btn"
              onClick={handleFillDemo}
              id="guard-btn-fill-demo"
            >
              <Sparkles size={16} className="sparkle-icon" />
              <span>Autofill Demo Credentials (demo@unpdf.app)</span>
            </button>
          </div>

          <div className="auth-modal-footer">
            <CheckCircle2 size={14} className="privacy-icon" />
            <span>100% Client-Side • Decryption runs entirely in your browser</span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="guard-features-grid" id="guard-features">
          <div className="guard-feature-card">
            <Cpu size={22} className="feature-icon" />
            <h3>100% Browser Decryption</h3>
            <p>Your PDF files are decrypted locally using WebCrypto API. Data never leaves your device.</p>
          </div>
          <div className="guard-feature-card">
            <Zap size={22} className="feature-icon" />
            <h3>Instant Password Removal</h3>
            <p>Remove passwords in seconds and download clean, passwordless PDFs permanently.</p>
          </div>
          <div className="guard-feature-card">
            <History size={22} className="feature-icon" />
            <h3>Saved Activity History</h3>
            <p>Keep track of your processed files across sessions securely in your browser account.</p>
          </div>
        </div>

        <footer className="app-footer" id="guard-footer">
          <p>© {new Date().getFullYear()} UnPDF. Protected PDF password remover.</p>
        </footer>
      </div>
    </div>
  );
};
