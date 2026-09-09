import React, { useState } from 'react';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import { Lock, FileUp, Download, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export const PDFEncryptTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [encrypting, setEncrypting] = useState(false);
  const [encryptedBytes, setEncryptedBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file.');
        return;
      }
      setSelectedFile(file);
      setEncryptedBytes(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file.');
        return;
      }
      setSelectedFile(file);
      setEncryptedBytes(null);
      setError(null);
    }
  };

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !password.trim()) return;

    setEncrypting(true);
    setError(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);

      // Encrypt PDF using @pdfsmaller/pdf-encrypt
      const resultBytes = await encryptPDF(pdfBytes, password, {
        ownerPassword: password + '_owner',
        algorithm: 'AES-256',
        allowPrinting: true,
        allowModifying: false,
        allowCopying: false
      });

      setEncryptedBytes(resultBytes);
    } catch (err: any) {
      console.error("Encryption error:", err);
      setError(err.message || 'Failed to encrypt PDF. Make sure the file is not already encrypted.');
    } finally {
      setEncrypting(false);
    }
  };

  const handleDownload = () => {
    if (!encryptedBytes || !selectedFile) return;
    const blob = new Blob([encryptedBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const downloadName = selectedFile.name.replace(/\.pdf$/i, '') + '_protected.pdf';

    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  };

  return (
    <div className="encrypt-tool-container" id="pdf-encrypt-tool">
      <div className="encrypt-tool-header">
        <Lock className="header-icon" size={24} />
        <div>
          <h2>Encrypt & Password Protect PDF</h2>
          <p>Add strong password security and permissions to your unencrypted PDF files.</p>
        </div>
      </div>

      <div 
        className={`encrypt-dropzone ${selectedFile ? 'has-file' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="file-input-hidden"
          id="input-encrypt-file"
        />
        <label htmlFor="input-encrypt-file" className="encrypt-dropzone-label">
          <FileUp size={36} className="upload-icon" />
          {selectedFile ? (
            <div className="file-preview-name">
              <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              <span className="change-file-hint">Click to choose a different PDF</span>
            </div>
          ) : (
            <div>
              <strong>Drag & drop a PDF file here</strong>, or <em>click to browse</em>
            </div>
          )}
        </label>
      </div>

      {selectedFile && (
        <form onSubmit={handleEncrypt} className="encrypt-form" id="form-encrypt-pdf">
          <div className="form-group">
            <label htmlFor="input-encrypt-password">Set Password Security</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to protect PDF"
                className="password-input"
                required
                id="input-encrypt-password"
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="encrypt-actions">
            <button 
              type="submit" 
              className="btn-action btn-primary"
              disabled={encrypting || !password.trim()}
              id="btn-submit-encrypt"
            >
              {encrypting ? (
                <>
                  <RefreshCw className="spinner" size={16} />
                  <span>Encrypting Document...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Encrypt & Protect PDF</span>
                </>
              )}
            </button>

            {encryptedBytes && (
              <button 
                type="button" 
                className="btn-action btn-success"
                onClick={handleDownload}
                id="btn-download-encrypted"
              >
                <Download size={16} />
                <span>Download Protected PDF</span>
              </button>
            )}
          </div>

          {encryptedBytes && (
            <div className="success-banner">
              <CheckCircle2 size={16} />
              <span>PDF successfully encrypted with password protection!</span>
            </div>
          )}
        </form>
      )}

      <div className="security-note">
        <ShieldAlert size={16} />
        <span>100% Client-Side Processing: Your PDF and password stay strictly on your local device.</span>
      </div>
    </div>
  );
};
