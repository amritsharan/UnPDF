import React, { useState } from 'react';
import { FileKey, LogIn, UserPlus, LogOut, History, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserHistoryModal } from './UserHistoryModal';
import { PasswordToolModal } from './PasswordToolModal';

export const Header: React.FC = () => {
  const { user, history, openAuthModal, logout } = useAuth();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPasswordToolOpen, setIsPasswordToolOpen] = useState(false);

  return (
    <header className="app-header" id="app-header-main">
      {/* Top Bar for Auth controls & Password Tool */}
      <div className="top-auth-bar" id="top-auth-bar">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="history-pill-btn"
            onClick={() => setIsPasswordToolOpen(true)}
            id="btn-open-password-tool"
            title="Open Password Generator & Strength Tool"
            style={{ background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#a78bfa' }}
          >
            <KeyRound size={14} />
            <span>Password Tools</span>
          </button>
        </div>

        {user ? (
          <div className="user-profile-menu" id="user-profile-menu">
            <button
              type="button"
              className="user-avatar-btn"
              onClick={() => setIsHistoryOpen(true)}
              id="btn-open-user-history-avatar"
              title="View account profile & history"
            >
              <div className="avatar-circle">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="user-display-name">{user.name}</span>
            </button>

            <button
              type="button"
              className="history-pill-btn"
              onClick={() => setIsHistoryOpen(true)}
              id="btn-open-user-history"
              title="View unlocked files history"
            >
              <History size={14} />
              <span>History</span>
              {history.length > 0 && <span className="history-count-badge">{history.length}</span>}
            </button>

            <button
              type="button"
              className="auth-bar-btn btn-logout"
              onClick={logout}
              id="btn-user-logout"
              title="Log Out"
            >
              <LogOut size={15} />
              <span className="btn-text">Log Out</span>
            </button>
          </div>
        ) : (
          <div className="auth-action-buttons" id="auth-action-buttons">
            <button
              type="button"
              className="auth-bar-btn btn-login"
              onClick={() => openAuthModal('login')}
              id="btn-header-login"
            >
              <LogIn size={15} />
              <span>Log In</span>
            </button>

            <button
              type="button"
              className="auth-bar-btn btn-signup"
              onClick={() => openAuthModal('signup')}
              id="btn-header-signup"
            >
              <UserPlus size={15} />
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>

      <div className="logo-container" id="app-logo">
        <FileKey className="logo-icon" aria-hidden="true" />
      </div>
      <h1 className="app-title" id="app-title-text">UnPDF</h1>
      <p className="app-subtitle" id="app-subtitle-desc">
        Instantly remove password protection and restrictions from your PDF files. 
        All decryption runs 100% locally in your browser — your files never touch any servers.
      </p>

      {/* Account history modal */}
      <UserHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      {/* Password Security Tool modal */}
      <PasswordToolModal isOpen={isPasswordToolOpen} onClose={() => setIsPasswordToolOpen(false)} />
    </header>
  );
};

