import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const SecurityBadge: React.FC = () => {
  return (
    <div className="security-badge" id="offline-security-badge">
      <ShieldCheck size={18} aria-hidden="true" />
      <span>100% Secure Client-Side Processing. Your PDFs are decrypted in your browser and never sent to a server.</span>
    </div>
  );
};
