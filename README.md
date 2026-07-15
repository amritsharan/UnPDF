# UnPDF — Secure PDF Password Remover

UnPDF is a modern, privacy-first, and 100% client-side web application designed to instantly remove password protection and restrictions from your PDF files. 

Because it operates entirely on the Web Crypto API in your browser, **your PDF documents and passwords never touch a server** — they are processed completely offline on your local device.

---

## ✨ Features

- 🔒 **100% Client-Side Decryption:** Runs entirely in the browser using the Web Crypto API. Safe for sensitive corporate or personal data.
- 🎨 **Premium Glassmorphic Design:** A state-of-the-art dark-mode interface featuring smooth animations, glows, and cursor-reactive hover elements.
- 📂 **Multi-File Queue:** Upload, manage, and decrypt multiple PDF documents simultaneously.
- 📝 **Preserved Filenames:** Intelligently saves unlocked documents as `<original_name>_unlocked.pdf` without generic or random hashes.
- 👁️ **Instant Preview:** View the decrypted PDF content in a new browser tab with proper filename preservation in the viewer.
- ⚡ **Wide Support:** Decrypts both modern AES-256 (PDF 2.0) and legacy RC4 password-protected PDF files.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 8](https://vite.dev/)
- **Decryption Engine:** [@pdfsmaller/pdf-decrypt](https://www.npmjs.com/package/@pdfsmaller/pdf-decrypt) & [pdf-lib](https://pdf-lib.js.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** Vanilla CSS (Preloaded Google Fonts: *Outfit* and *Inter*)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (version 18+) installed on your machine.

### Installation

1. Clone or download this repository to your local drive.
2. Open your terminal in the project directory and run:
   ```bash
   npm install
   ```

### Development Server

Launch the Vite local development server:
```bash
npm run dev
```
Once started, open **[http://localhost:5173/](http://localhost:5173/)** in your web browser.

### Production Build

To compile a minified, production-ready bundle of the static assets:
```bash
npm run build
```
The compiled files will be located in the `dist/` directory, which can be deployed to any static site hosting provider (GitHub Pages, Vercel, Netlify, etc.).

---

## 🔒 Security & Privacy

Traditional online PDF password removers require you to upload your document to their servers, posing significant data security and compliance risks. 

UnPDF solves this by using the browser's built-in file readers and Web Crypto APIs:
- The PDF is read directly from your local disk into browser memory as a binary array (`Uint8Array`).
- The decryption algorithm matches the keys and unlocks the file locally.
- A temporary browser object URL is created to initiate the file download.
- No network requests are made containing your document data or passwords.

---

## 📄 License

This project is licensed under the MIT License. Feel free to modify and adapt it to your needs!
