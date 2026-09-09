import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, signup, openAuthModal } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal state or mode changes
  useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setShowPassword(false);
    setError(null);
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (authModalMode === 'login') {
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
        // Sign Up Validation
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
    openAuthModal('login');
    setEmail('demo@unpdf.app');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="modal-overlay" id="auth-modal-backdrop" onClick={closeAuthModal}>
      <div 
        className="auth-modal-card" 
        id="auth-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="modal-close-btn" 
          onClick={closeAuthModal}
          id="btn-close-auth-modal"
          aria-label="Close auth modal"
        >
          <X size={20} />
        </button>

        {/* Header Icon */}
        <div className="auth-header-icon" id="auth-modal-badge">
          <ShieldCheck size={28} />
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs" id="auth-tabs-switcher">
          <button
            type="button"
            className={`auth-tab-btn ${authModalMode === 'login' ? 'active' : ''}`}
            onClick={() => openAuthModal('login')}
            id="tab-btn-login"
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authModalMode === 'signup' ? 'active' : ''}`}
            onClick={() => openAuthModal('signup')}
            id="tab-btn-signup"
          >
            Sign Up
          </button>
        </div>

        <div className="auth-modal-body">
          <h2 className="auth-title" id="auth-modal-title">
            {authModalMode === 'login' ? 'Welcome Back' : 'Create Free Account'}
          </h2>
          <p className="auth-subtitle" id="auth-modal-desc">
            {authModalMode === 'login'
              ? 'Access your saved decryption activity and preferences.'
              : 'Sign up to keep track of your PDF unlocking history.'}
          </p>

          {error && (
            <div className="auth-error-banner" id="auth-error-message">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" id="auth-main-form">
            {authModalMode === 'signup' && (
              <div className="form-group" id="group-signup-name">
                <label className="form-label" htmlFor="input-signup-name">Full Name</label>
                <div className="input-with-icon">
                  <User className="field-icon" size={18} />
                  <input
                    id="input-signup-name"
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

            <div className="form-group" id="group-auth-email">
              <label className="form-label" htmlFor="input-auth-email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="field-icon" size={18} />
                <input
                  id="input-auth-email"
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" id="group-auth-password">
              <label className="form-label" htmlFor="input-auth-password">Password</label>
              <div className="input-with-icon">
                <Lock className="field-icon" size={18} />
                <input
                  id="input-auth-password"
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
                  id="btn-toggle-password-visibility"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authModalMode === 'signup' && (
              <div className="form-group" id="group-signup-confirm-password">
                <label className="form-label" htmlFor="input-signup-confirm-password">Confirm Password</label>
                <div className="input-with-icon">
                  <Lock className="field-icon" size={18} />
                  <input
                    id="input-signup-confirm-password"
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
              id="btn-submit-auth-form"
            >
              {isSubmitting ? (
                <span className="spinner"></span>
              ) : authModalMode === 'login' ? (
                'Log In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset */}
          <div className="demo-login-divider">
            <span>Or try instantly</span>
          </div>

          <button
            type="button"
            className="demo-account-btn"
            onClick={handleFillDemo}
            id="btn-fill-demo-account"
          >
            <Sparkles size={16} className="sparkle-icon" />
            <span>Fill Demo Credentials (demo@unpdf.app)</span>
          </button>
        </div>

        {/* Footer Note */}
        <div className="auth-modal-footer">
          <CheckCircle2 size={14} className="privacy-icon" />
          <span>100% Privacy Focused • Passwords never leave your browser</span>
        </div>
      </div>
    </div>
  );
};
