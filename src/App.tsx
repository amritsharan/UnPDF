import { useState } from 'react';
import { isEncrypted, decryptPDF } from '@pdfsmaller/pdf-decrypt';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { PDFCard } from './components/PDFCard';
import type { PDFFileState } from './components/PDFCard';
import { SecurityBadge } from './components/SecurityBadge';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { AuthGuard } from './components/AuthGuard';
import { Trash2, HelpCircle, UserCheck } from 'lucide-react';

function MainAppContent() {
  const [files, setFiles] = useState<PDFFileState[]>([]);
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
    // Set status to unlocking
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'unlocking' } : f));

    // Retrieve the file state
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

      // Perform local WebCrypto decryption
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

      // Record in user history if logged in
      recordUnlockedFile(currentFileState.name, currentFileState.size);
    } catch (err: any) {
      console.error("Decryption failed for:", currentFileState.name, err);
      
      // Customize message based on common decryption error triggers
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

  return (
    <div className="app-container" id="app-main-layout">
      {/* Top Header */}
      <Header />

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
          <div className="section-header">
            <h2 className="section-title" id="section-title-label">
              Queue ({files.length} {files.length === 1 ? 'file' : 'files'})
            </h2>
            <button className="clear-btn" onClick={handleClearAll} id="btn-clear-queue">
              <Trash2 size={16} />
              <span>Clear queue</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} id="cards-container">
            {files.map(f => (
              <PDFCard
                key={f.id}
                fileState={f}
                onRemove={handleRemoveFile}
                onUnlock={handleUnlockFile}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state" id="empty-state-notice">
          <p>No PDF files uploaded yet. Drag files or click the browser zone above to begin.</p>
        </div>
      )}

      {/* Interactive Guide Panel */}
      <div className="guide-box" id="guide-usage-tips">
        <h3 className="guide-title" id="guide-box-title">
          <HelpCircle size={18} />
          <span>How to use UnPDF</span>
        </h3>
        <ul className="guide-list" id="guide-steps-list">
          <li className="guide-item" id="guide-step-1">
            <strong>Upload:</strong> Select or drag password-protected PDF files into the dropzone. You can process multiple PDFs simultaneously.
          </li>
          <li className="guide-item" id="guide-step-2">
            <strong>Decrypt:</strong> Enter the correct PDF password and click <em>Unlock PDF</em>. The file is decrypted locally.
          </li>
          <li className="guide-item" id="guide-step-3">
            <strong>Download:</strong> Click <em>Download Passwordless</em> to save the unlocked PDF file. It will remain passwordless permanently.
          </li>
        </ul>
      </div>

      <footer className="app-footer" id="app-footer-credits">
        <p>© {new Date().getFullYear()} UnPDF. Developed for offline, privacy-first PDF password removal.</p>
      </footer>

      {/* Login & Sign Up Modal */}
      <AuthModal />
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
