import React from 'react';
import { FileKey } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="app-header" id="app-header-main">
      <div className="logo-container" id="app-logo">
        <FileKey className="logo-icon" aria-hidden="true" />
      </div>
      <h1 className="app-title" id="app-title-text">UnPDF</h1>
      <p className="app-subtitle" id="app-subtitle-desc">
        Instantly remove password protection and restrictions from your PDF files. 
        All decryption runs 100% locally in your browser — your files never touch any servers.
      </p>
    </header>
  );
};
