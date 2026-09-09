import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { X, Eye, FileText, Download, Layers, ShieldCheck, Info, Calendar, User, Cpu } from 'lucide-react';
import type { PDFFileState } from './PDFCard';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileState: PDFFileState | null;
}

interface PDFMetadata {
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ isOpen, onClose, fileState }) => {
  const [activeTab, setActiveTab] = useState<'viewer' | 'metadata'>('viewer');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !fileState) {
      setPreviewUrl(null);
      setMetadata(null);
      return;
    }

    let url: string;
    let isMounted = true;
    setLoading(true);

    const loadPDFData = async () => {
      try {
        let pdfBytes: Uint8Array;

        if (fileState.status === 'success' && fileState.decryptedBytes) {
          pdfBytes = fileState.decryptedBytes;
          const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
          url = URL.createObjectURL(blob);
        } else {
          url = URL.createObjectURL(fileState.file);
          const buffer = await fileState.file.arrayBuffer();
          pdfBytes = new Uint8Array(buffer);
        }

        if (isMounted) {
          setPreviewUrl(url);
        }

        // Parse Metadata using pdf-lib
        try {
          const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
          if (isMounted) {
            setMetadata({
              pageCount: pdfDoc.getPageCount(),
              title: pdfDoc.getTitle() || undefined,
              author: pdfDoc.getAuthor() || undefined,
              subject: pdfDoc.getSubject() || undefined,
              creator: pdfDoc.getCreator() || undefined,
              producer: pdfDoc.getProducer() || undefined,
              creationDate: pdfDoc.getCreationDate() ? pdfDoc.getCreationDate()?.toLocaleString() : undefined,
              modificationDate: pdfDoc.getModificationDate() ? pdfDoc.getModificationDate()?.toLocaleString() : undefined,
            });
          }
        } catch (metaErr) {
          console.warn("Unable to extract metadata:", metaErr);
          if (isMounted) {
            setMetadata({ pageCount: 1 });
          }
        }
      } catch (err) {
        console.error("Preview load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPDFData();

    return () => {
      isMounted = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [isOpen, fileState]);

  if (!isOpen || !fileState) return null;

  const handleDownload = () => {
    if (!previewUrl) return;
    const downloadName = fileState.status === 'success'
      ? fileState.name.replace(/\.pdf$/i, '') + '_unlocked.pdf'
      : fileState.name;

    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 1000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="modal-overlay" id="pdf-preview-modal-backdrop" onClick={onClose}>
      <div 
        className="preview-modal-card" 
        id="pdf-preview-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="preview-modal-header">
          <div className="preview-title-wrap">
            <FileText size={20} className="preview-header-icon" />
            <div>
              <h3 className="preview-filename" title={fileState.name}>{fileState.name}</h3>
              <span className="preview-file-size">{formatFileSize(fileState.size)}</span>
            </div>
          </div>

          <div className="preview-header-actions">
            <div className="preview-tab-buttons">
              <button 
                className={`tab-btn ${activeTab === 'viewer' ? 'active' : ''}`}
                onClick={() => setActiveTab('viewer')}
                id="btn-tab-viewer"
              >
                <Eye size={14} />
                <span>Viewer</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'metadata' ? 'active' : ''}`}
                onClick={() => setActiveTab('metadata')}
                id="btn-tab-metadata"
              >
                <Info size={14} />
                <span>Inspector</span>
              </button>
            </div>

            <button 
              className="btn-action btn-success" 
              onClick={handleDownload}
              id="btn-modal-download"
            >
              <Download size={15} />
              <span>Download</span>
            </button>

            <button 
              className="modal-close-btn" 
              onClick={onClose}
              id="btn-close-preview-modal"
              aria-label="Close preview modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="preview-modal-body">
          {loading ? (
            <div className="preview-loading-state">
              <div className="spinner-large"></div>
              <p>Loading document preview...</p>
            </div>
          ) : activeTab === 'viewer' ? (
            <div className="preview-iframe-wrapper">
              {previewUrl ? (
                <iframe 
                  src={`${previewUrl}#toolbar=1`}
                  title="PDF Preview"
                  className="pdf-preview-iframe"
                  id="pdf-iframe-element"
                />
              ) : (
                <p>Failed to load preview.</p>
              )}
            </div>
          ) : (
            <div className="metadata-inspector-grid" id="metadata-inspector-grid">
              <div className="meta-card">
                <Layers size={18} className="meta-icon" />
                <div className="meta-info">
                  <span className="meta-label">Total Pages</span>
                  <span className="meta-value">{metadata?.pageCount || 'Unknown'}</span>
                </div>
              </div>

              <div className="meta-card">
                <ShieldCheck size={18} className="meta-icon" />
                <div className="meta-info">
                  <span className="meta-label">Security State</span>
                  <span className="meta-value" style={{ color: 'var(--color-emerald)' }}>
                    {fileState.status === 'success' ? 'Password Removed' : 'Passwordless / Unlocked'}
                  </span>
                </div>
              </div>

              <div className="meta-card">
                <FileText size={18} className="meta-icon" />
                <div className="meta-info">
                  <span className="meta-label">Document Title</span>
                  <span className="meta-value">{metadata?.title || 'Not specified'}</span>
                </div>
              </div>

              <div className="meta-card">
                <User size={18} className="meta-icon" />
                <div className="meta-info">
                  <span className="meta-label">Author</span>
                  <span className="meta-value">{metadata?.author || 'Not specified'}</span>
                </div>
              </div>

              <div className="meta-card">
                <Cpu size={18} className="meta-icon" />
                <div className="meta-info">
                  <span className="meta-label">PDF Generator / Producer</span>
                  <span className="meta-value">{metadata?.producer || metadata?.creator || 'Web Crypto API / pdf-lib'}</span>
                </div>
              </div>

              <div className="meta-card">
                <Calendar size={18} className="meta-icon" />
                <div className="meta-info">
                  <span className="meta-label">Creation Date</span>
                  <span className="meta-value">{metadata?.creationDate || 'Not specified'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
