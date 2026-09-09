import { useState } from 'react';
import JSZip from 'jszip';
import { isEncrypted, decryptPDF } from '@pdfsmaller/pdf-decrypt';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { PDFCard } from './components/PDFCard';
import type { PDFFileState } from './components/PDFCard';
import { SecurityBadge } from './components/SecurityBadge';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { AuthGuard } from './components/AuthGuard';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { PDFEncryptTool } from './components/PDFEncryptTool';
import { Trash2, HelpCircle, UserCheck, Unlock, Lock, Download, KeyRound } from 'lucide-react';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<'unlock' | 'encrypt'>('unlock');
  const [files, setFiles] = useState<PDFFileState[]>([]);
  const [masterPassword, setMasterPassword] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'locked' | 'unlocked' | 'error'>('all');
  const [previewFile, setPreviewFile] = useState<PDFFileState | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const { recordUnlockedFile, user } = useAuth();

  // If user is not logged in, block access and display AuthGuard screen
  if (!user) {
    return <AuthGuard />;
  }

  // Callback when files are selected or dropped
  const handleFilesSelected = (newFiles: File[]) => {
    // Filter out duplicates (same file name and size in current session)
    const filteredFiles = newFiles.filter(nf => 
      !files.some(f => f.name === nf.name && f.size === nf.size)
    );

    if (filteredFiles.length === 0) return;

    const newStates: PDFFileState[] = filteredFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
      name: file.name,
      size: file.size,
      status: 'checking',
      file
    }));

    setFiles(prev => [...prev, ...newStates]);

    // Process each file's encryption status asynchronously
    newStates.forEach(async (state) => {
      try {
        const fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(state.file);
        });
        const pdfBytes = new Uint8Array(fileData);

        const checkResult = await isEncrypted(pdfBytes);

        setFiles(prev => prev.map(f => {
          if (f.id === state.id) {
            return {
              ...f,
              status: checkResult.encrypted ? 'locked' : 'passwordless'
            };
          }
          return f;
        }));
      } catch (err: any) {
        console.error("Checking encryption failed for file:", state.name, err);
        setFiles(prev => prev.map(f => {
          if (f.id === state.id) {
            return {
              ...f,
              status: 'error',
              errorMessage: 'Unable to analyze PDF structure. The file might be corrupted.'
            };
          }
          return f;
        }));
      }
    });
  };

  // Handler to remove a file from list
  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Handler to clear all files
  const handleClearAll = () => {
    setFiles([]);
  };

  // Handler to unlock an individual file with a password
  const handleUnlockFile = async (id: string, password: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'unlocking' } : f));

    const currentFileState = files.find(f => f.id === id);
    if (!currentFileState) return;

    try {
      const fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(currentFileState.file);
      });
      const pdfBytes = new Uint8Array(fileData);

      const decryptedBytes = await decryptPDF(pdfBytes, password);

      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            status: 'success',
            decryptedBytes,
            errorMessage: undefined
          };
        }
        return f;
      }));

      recordUnlockedFile(currentFileState.name, currentFileState.size);
    } catch (err: any) {
      console.error("Decryption failed for:", currentFileState.name, err);
      
      let message = 'Incorrect password. Please verify and try again.';
      if (err.message && !err.message.toLowerCase().includes('password')) {
        message = `Decryption failed: ${err.message}`;
      }

      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            status: 'error',
            errorMessage: message
          };
        }
        return f;
      }));
    }
  };

  // Apply Master Password to all locked files in queue
  const handleBatchUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword.trim()) return;

    const lockedFiles = files.filter(f => f.status === 'locked' || f.status === 'error');
    for (const f of lockedFiles) {
      await handleUnlockFile(f.id, masterPassword);
    }
  };

  // Download all unlocked/passwordless PDFs into a ZIP archive
  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      let count = 0;

      for (const f of files) {
        if (f.status === 'success' && f.decryptedBytes) {
          zip.file(f.name.replace(/\.pdf$/i, '') + '_unlocked.pdf', f.decryptedBytes);
          count++;
        } else if (f.status === 'passwordless') {
          const buffer = await f.file.arrayBuffer();
          zip.file(f.name, buffer);
          count++;
        }
      }

      if (count === 0) return;

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unpdf_unlocked_files_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 2000);
    } catch (err) {
      console.error("ZIP creation failed:", err);
    } finally {
      setIsZipping(false);
    }
  };

  // Filtered files list
  const visibleFiles = files.filter(f => {
    if (filterState === 'locked') return f.status === 'locked' || f.status === 'unlocking';
    if (filterState === 'unlocked') return f.status === 'success' || f.status === 'passwordless';
    if (filterState === 'error') return f.status === 'error';
    return true;
  });

  const unlockedCount = files.filter(f => f.status === 'success' || f.status === 'passwordless').length;
  const lockedCount = files.filter(f => f.status === 'locked' || f.status === 'error').length;

  return (
    <div className="app-container" id="app-main-layout">
      {/* Top Header */}
      <Header />

      {/* Mode Switcher Tabs */}
      <div className="mode-switcher-tabs" id="mode-switcher-tabs">
        <button 
          className={`mode-tab-btn ${activeTab === 'unlock' ? 'active' : ''}`}
          onClick={() => setActiveTab('unlock')}
          id="btn-mode-unlock"
        >
          <Unlock size={16} />
          <span>Unlock PDF Password</span>
        </button>
        <button 
          className={`mode-tab-btn ${activeTab === 'encrypt' ? 'active' : ''}`}
          onClick={() => setActiveTab('encrypt')}
          id="btn-mode-encrypt"
        >
          <Lock size={16} />
          <span>Encrypt & Protect PDF</span>
        </button>
      </div>

      {activeTab === 'unlock' ? (
        <>
          {/* Main Drag/Drop Uploader */}
          <Dropzone onFilesSelected={handleFilesSelected} />

          {/* Security Level Indicator */}
          <SecurityBadge />

          {/* Account session banner */}
          <div className="user-session-banner" id="user-session-banner">
            <UserCheck size={16} />
            <span>Logged in as <strong>{user.name}</strong> ({user.email}). Unlocked PDFs are saved to your activity history.</span>
          </div>

          {/* File Processing Dashboard */}
          {files.length > 0 ? (
            <div className="files-section" id="files-section-dashboard">
              {/* Batch Action Toolbar */}
              <div className="batch-toolbar" id="batch-toolbar">
                {lockedCount > 0 && (
                  <form onSubmit={handleBatchUnlock} className="master-password-form" id="master-password-form">
                    <KeyRound size={16} className="batch-icon" />
                    <input 
                      type="password"
                      placeholder="Master Password for all locked files"
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      className="password-input"
                      id="input-master-password"
                    />
                    <button 
                      type="submit" 
                      className="btn-action btn-primary"
                      disabled={!masterPassword.trim()}
                      id="btn-batch-unlock"
                    >
                      <Unlock size={14} />
                      <span>Unlock All Locked ({lockedCount})</span>
                    </button>
                  </form>
                )}

                {unlockedCount > 0 && (
                  <button 
                    className="btn-action btn-success btn-download-zip" 
                    onClick={handleDownloadAllZip}
                    disabled={isZipping}
                    id="btn-download-all-zip"
                  >
                    <Download size={14} />
                    <span>{isZipping ? 'Zipping...' : `Download All Unlocked (${unlockedCount}) as .ZIP`}</span>
                  </button>
                )}
              </div>

              {/* Queue Controls & Filter Bar */}
              <div className="section-header">
                <div className="queue-filter-group">
                  <h2 className="section-title" id="section-title-label">
                    Queue ({files.length})
                  </h2>
                  <div className="filter-pills">
                    <button 
                      className={`filter-pill ${filterState === 'all' ? 'active' : ''}`}
                      onClick={() => setFilterState('all')}
                      id="filter-pill-all"
                    >
                      All ({files.length})
                    </button>
                    <button 
                      className={`filter-pill ${filterState === 'locked' ? 'active' : ''}`}
                      onClick={() => setFilterState('locked')}
                      id="filter-pill-locked"
                    >
                      Locked ({lockedCount})
                    </button>
                    <button 
                      className={`filter-pill ${filterState === 'unlocked' ? 'active' : ''}`}
                      onClick={() => setFilterState('unlocked')}
                      id="filter-pill-unlocked"
                    >
                      Unlocked ({unlockedCount})
                    </button>
                  </div>
                </div>

                <button className="clear-btn" onClick={handleClearAll} id="btn-clear-queue">
                  <Trash2 size={16} />
                  <span>Clear queue</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} id="cards-container">
                {visibleFiles.map(f => (
                  <PDFCard
                    key={f.id}
                    fileState={f}
                    onRemove={handleRemoveFile}
                    onUnlock={handleUnlockFile}
                    onPreview={(st) => setPreviewFile(st)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" id="empty-state-notice">
              <p>No PDF files uploaded yet. Drag files or click the browser zone above to begin.</p>
            </div>
          )}
        </>
      ) : (
        /* Encrypt Tool Mode */
        <PDFEncryptTool />
      )}

      {/* Interactive Guide Panel */}
      <div className="guide-box" id="guide-usage-tips">
        <h3 className="guide-title" id="guide-box-title">
          <HelpCircle size={18} />
          <span>How to use UnPDF</span>
        </h3>
        <ul className="guide-list" id="guide-steps-list">
          <li className="guide-item" id="guide-step-1">
            <strong>Upload / Encrypt:</strong> Select or drag PDF files into the dropzone to remove passwords or encrypt passwordless PDFs.
          </li>
          <li className="guide-item" id="guide-step-2">
            <strong>Decrypt / Inspect:</strong> Enter password to unlock locally, or inspect file metadata inside the built-in PDF viewer.
          </li>
          <li className="guide-item" id="guide-step-3">
            <strong>Download:</strong> Save individual PDFs or download your entire batch as a compressed `.ZIP` file.
          </li>
        </ul>
      </div>

      <footer className="app-footer" id="app-footer-credits">
        <p>© {new Date().getFullYear()} UnPDF. Offline, privacy-first PDF password removal & encryption utility.</p>
      </footer>

      {/* Login & Sign Up Modal */}
      <AuthModal />

      {/* PDF Inline Preview & Inspector Modal */}
      <PDFPreviewModal 
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        fileState={previewFile}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
