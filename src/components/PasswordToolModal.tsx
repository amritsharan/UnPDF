import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, RefreshCw, KeyRound, Sparkles } from 'lucide-react';

interface PasswordToolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordToolModal: React.FC<PasswordToolModalProps> = ({ isOpen, onClose }) => {
  const [testPassword, setTestPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [passLength, setPassLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);

  if (!isOpen) return null;

  // Calculate password strength score (0 to 100)
  const calculateStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: '#71717a' };
    let score = 0;
    if (pwd.length >= 8) score += 20;
    if (pwd.length >= 12) score += 20;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15;

    if (score < 40) return { score, label: 'Weak', color: '#ef4444' };
    if (score < 75) return { score, label: 'Medium', color: '#f59e0b' };
    return { score, label: 'Strong', color: '#10b981' };
  };

  const strength = calculateStrength(testPassword);

  const generateSecurePassword = () => {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let result = '';
    const cryptoObj = window.crypto || (window as any).msCrypto;
    const values = new Uint32Array(passLength);
    cryptoObj.getRandomValues(values);

    for (let i = 0; i < passLength; i++) {
      result += chars[values[i] % chars.length];
    }

    setGeneratedPassword(result);
    setCopied(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" id="password-tool-modal-backdrop" onClick={onClose}>
      <div 
        className="password-tool-modal-card"
        id="password-tool-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <KeyRound size={20} className="modal-header-icon" />
            <h3>Password Security & Generator Tool</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="tool-modal-body">
          {/* Section 1: Password Strength Analyzer */}
          <div className="tool-section">
            <h4><ShieldCheck size={16} /> Strength Analyzer</h4>
            <div className="analyzer-wrapper">
              <input 
                type="text"
                placeholder="Type or paste password to analyze..."
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="password-input"
                id="input-strength-analyzer"
              />
              {testPassword && (
                <div className="strength-meter-bar">
                  <div 
                    className="strength-fill"
                    style={{ width: `${strength.score}%`, backgroundColor: strength.color }}
                  />
                </div>
              )}
              <div className="strength-meta">
                <span>Strength: <strong style={{ color: strength.color }}>{strength.label}</strong></span>
                <span>Score: {strength.score}/100</span>
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* Section 2: Password Generator */}
          <div className="tool-section">
            <h4><Sparkles size={16} /> Random Password Generator</h4>
            <div className="generator-controls">
              <div className="control-row">
                <label>Length: <strong>{passLength}</strong></label>
                <input 
                  type="range"
                  min="8"
                  max="32"
                  value={passLength}
                  onChange={(e) => setPassLength(Number(e.target.value))}
                  className="length-slider"
                />
              </div>

              <div className="checkbox-row">
                <label>
                  <input 
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                  />
                  Numbers (0-9)
                </label>
                <label>
                  <input 
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                  />
                  Symbols (!@#$)
                </label>
              </div>

              <button 
                type="button" 
                className="btn-action btn-primary"
                onClick={generateSecurePassword}
                id="btn-generate-password"
              >
                <RefreshCw size={15} />
                <span>Generate Password</span>
              </button>

              {generatedPassword && (
                <div className="generated-result-box">
                  <span className="generated-text">{generatedPassword}</span>
                  <button 
                    type="button"
                    className="copy-btn"
                    onClick={() => copyToClipboard(generatedPassword)}
                    title="Copy to clipboard"
                    id="btn-copy-generated-password"
                  >
                    {copied ? <Check size={16} color="var(--color-emerald)" /> : <Copy size={16} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
