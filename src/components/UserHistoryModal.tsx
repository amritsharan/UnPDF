import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, History, FileText, Trash2, Shield, Calendar, User as UserIcon, Download } from 'lucide-react';

interface UserHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserHistoryModal: React.FC<UserHistoryModalProps> = ({ isOpen, onClose }) => {
  const { user, history, clearHistory } = useAuth();

  if (!isOpen || !user) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['ID', 'File Name', 'Size (Bytes)', 'Unlocked At'];
    const rows = history.map(item => [
      `"${item.id}"`,
      `"${item.fileName.replace(/"/g, '""')}"`,
      item.fileSize,
      `"${item.unlockedAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unpdf_history_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const handleExportJSON = () => {
    if (history.length === 0) return;
    const jsonString = JSON.stringify(history, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unpdf_history_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <div className="modal-overlay" id="user-history-modal-backdrop" onClick={onClose}>
      <div 
        className="history-modal-card" 
        id="user-history-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          id="btn-close-history-modal"
          aria-label="Close history modal"
        >
          <X size={20} />
        </button>

        {/* User Card Header */}
        <div className="history-modal-header">
          <div className="user-profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-profile-details">
            <h3 className="user-profile-name" id="user-profile-display-name">{user.name}</h3>
            <p className="user-profile-email" id="user-profile-display-email">{user.email}</p>
            <div className="user-profile-meta">
              <span><Calendar size={13} /> Joined {formatDate(user.createdAt).split(',')[0]}</span>
              <span className="user-badge-tag"><Shield size={12} /> Account Active</span>
            </div>
          </div>
        </div>

        {/* Unlocked Files Activity */}
        <div className="history-section">
          <div className="history-section-header">
            <div className="history-title-wrap">
              <History size={18} className="history-icon" />
              <h4 id="history-section-title">Unlocked Files ({history.length})</h4>
            </div>

            {history.length > 0 && (
              <div className="history-header-actions" style={{ display: 'flex', gap: '0.4rem' }}>
                <button 
                  type="button" 
                  className="export-btn"
                  onClick={handleExportCSV}
                  title="Export history to CSV"
                  id="btn-export-csv"
                >
                  <Download size={13} />
                  <span>CSV</span>
                </button>
                <button 
                  type="button" 
                  className="export-btn"
                  onClick={handleExportJSON}
                  title="Export history to JSON"
                  id="btn-export-json"
                >
                  <Download size={13} />
                  <span>JSON</span>
                </button>
                <button 
                  type="button" 
                  className="clear-history-btn"
                  onClick={clearHistory}
                  id="btn-clear-user-history"
                >
                  <Trash2 size={14} />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>

          {history.length > 0 ? (
            <div className="history-list" id="user-history-items-list">
              {history.map((item) => (
                <div key={item.id} className="history-item-card">
                  <div className="history-item-icon">
                    <FileText size={20} />
                  </div>
                  <div className="history-item-info">
                    <div className="history-item-name" title={item.fileName}>
                      {item.fileName}
                    </div>
                    <div className="history-item-meta">
                      <span>{formatFileSize(item.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(item.unlockedAt)}</span>
                    </div>
                  </div>
                  <span className="history-status-tag">Decrypted</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="history-empty-state" id="history-empty-notice">
              <UserIcon size={32} className="empty-icon" />
              <p>No decryption history yet.</p>
              <span>Unlock PDF files while signed in to keep track of your processed files.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

