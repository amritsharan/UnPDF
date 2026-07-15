import React, { useState } from 'react';
import { 
  File as FileIcon, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Eye, 
  EyeOff, 
  Download, 
  RefreshCw 
} from 'lucide-react';

export interface PDFFileState {
  id: string;
  name: string;
  size: number;
  status: 'checking' | 'passwordless' | 'locked' | 'unlocking' | 'success' | 'error';
  errorMessage?: string;
  decryptedBytes?: Uint8Array;
  file: File;
}

interface PDFCardProps {
  fileState: PDFFileState;
  onRemove: (id: string) => void;
  onUnlock: (id: string, password: string) => Promise<void>;
}

export const PDFCard: React.FC<PDFCardProps> = ({ fileState, onRemove, onUnlock }) => {
  const { id, name, size, status, errorMessage, decryptedBytes, file } = fileState;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Formatter for file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle Unlock Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onUnlock(id, password);
  };

  // Trigger File Download
  const handleDownload = () => {
    let downloadUrl: string;
    let downloadName: string;

    if (status === 'success' && decryptedBytes) {
      const blob = new Blob([decryptedBytes as any], { type: 'application/pdf' });
      downloadUrl = URL.createObjectURL(blob);
      downloadName = name.replace(/\.pdf$/i, '') + '_unlocked.pdf';
    } else {
      // For passwordless file, download the original
      downloadUrl = URL.createObjectURL(file);
      downloadName = name;
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();

    // Defer DOM cleanup and URL revocation to ensure Chrome registers the download name correctly
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    }, 2000);
  };

  // Open decrypted PDF in a new tab to let user see it directly
  const handlePreview = () => {
    let url: string;
    if (status === 'success' && decryptedBytes) {
      const fileObj = new File([decryptedBytes as any], name.replace(/\.pdf$/i, '') + '_unlocked.pdf', { type: 'application/pdf' });
      url = URL.createObjectURL(fileObj);
    } else {
      url = URL.createObjectURL(file);
    }

    window.open(url, '_blank');

    // Keep object URL active for browser tab rendering, then clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 30000);
  };

  // Determine card class based on state
  const getCardClass = () => {
    switch (status) {
      case 'passwordless': return 'state-passwordless';
      case 'locked': return 'state-locked';
      case 'unlocking': return 'state-unlocking';
      case 'success': return 'state-success';
      case 'error': return 'state-error';
      default: return '';
    }
  };

  return (
    <div className={`pdf-card ${getCardClass()}`} id={`pdf-card-${id}`}>
      {/* File Info Header */}
      <div className="card-header">
        <div className="file-info">
          <div className="file-icon-wrapper">
            <FileIcon size={22} />
          </div>
          <div className="file-details">
            <div className="file-name" title={name}>{name}</div>
            <div className="file-meta">
              <span>{formatSize(size)}</span>
              <span>•</span>
              {status === 'checking' && (
                <span className="status-badge badge-locked" style={{ background: 'rgba(255,255,255,0.05)', color: '#71717a' }}>
                  Analyzing...
                </span>
              )}
              {status === 'passwordless' && (
                <span className="status-badge badge-passwordless" id={`status-badge-passwordless-${id}`}>
                  Passwordless
                </span>
              )}
              {(status === 'locked' || status === 'error') && (
                <span className="status-badge badge-locked" id={`status-badge-locked-${id}`}>
                  Locked
                </span>
              )}
              {status === 'unlocking' && (
                <span className="status-badge badge-locked" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                  Unlocking...
                </span>
              )}
              {status === 'success' && (
                <span className="status-badge badge-success" id={`status-badge-success-${id}`}>
                  Unlocked
                </span>
              )}
            </div>
          </div>
        </div>

        <button 
          className="remove-card-btn" 
          onClick={() => onRemove(id)}
          title="Remove file"
          aria-label={`Remove file ${name}`}
          id={`btn-remove-${id}`}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Interactive Actions area */}
      <div className="card-actions">
        {/* State: Locked or Error (Enter Password Input) */}
        {(status === 'locked' || status === 'error' || status === 'unlocking') && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'flex-start' }}>
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="password-input"
                  placeholder="Enter PDF password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={status === 'unlocking'}
                  required
                  id={`password-input-${id}`}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  id={`btn-toggle-pass-${id}`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {status === 'error' && errorMessage && (
                <span className="error-message" id={`error-message-${id}`}>
                  <AlertCircle size={14} />
                  {errorMessage}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn-action btn-primary"
              disabled={status === 'unlocking' || !password.trim()}
              id={`btn-unlock-${id}`}
            >
              {status === 'unlocking' ? (
                <>
                  <RefreshCw className="spinner" size={16} />
                  <span>Unlocking...</span>
                </>
              ) : (
                <>
                  <Unlock size={16} />
                  <span>Unlock PDF</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* State: Passwordless (Already Unlocked) */}
        {status === 'passwordless' && (
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            <span style={{ color: 'var(--color-emerald)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} />
              This file is already passwordless.
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
              <button 
                onClick={handlePreview} 
                className="btn-action"
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)' }}
                title="View PDF content"
                id={`btn-view-passwordless-${id}`}
              >
                <Eye size={16} />
                <span>View PDF</span>
              </button>
              <button 
                onClick={handleDownload} 
                className="btn-action btn-success"
                id={`btn-download-passwordless-${id}`}
              >
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}

        {/* State: Decrypted Successfully */}
        {status === 'success' && (
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            <span style={{ color: 'var(--color-emerald)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Unlock size={16} />
              Password removed successfully!
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
              <button 
                onClick={handlePreview} 
                className="btn-action"
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)' }}
                title="View unlocked PDF content"
                id={`btn-view-success-${id}`}
              >
                <Eye size={16} />
                <span>View PDF</span>
              </button>
              <button 
                onClick={handleDownload} 
                className="btn-action btn-success"
                id={`btn-download-success-${id}`}
              >
                <Download size={16} />
                <span>Download Passwordless</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
