import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const pdfFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        pdfFiles.push(file);
      }
    }
    if (pdfFiles.length > 0) {
      onFilesSelected(pdfFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Track mouse position on dropzone to update dynamic glow effect in CSS
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      className={`dropzone-container ${isDragActive ? 'is-drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onClick={onButtonClick}
      id="pdf-dropzone"
      role="button"
      tabIndex={0}
      aria-label="Upload PDF files to unlock"
    >
      <input
        ref={fileInputRef}
        type="file"
        className="file-input"
        multiple
        accept=".pdf,application/pdf"
        onChange={handleFileInputChange}
        id="pdf-file-picker"
      />
      <div className="dropzone-content">
        <div className="upload-icon-container" id="upload-icon">
          <UploadCloud size={32} />
        </div>
        <div className="dropzone-text-group">
          <h3 className="dropzone-title" id="dropzone-title-text">Drag & drop your PDF files here</h3>
          <p className="dropzone-subtitle" id="dropzone-subtitle-text">or click to browse your local device</p>
        </div>
        <span className="status-badge badge-passwordless" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
          Supports multiple PDFs
        </span>
      </div>
    </div>
  );
};
