# TransEdit

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, local-first web application for reviewing and editing translation files (locale JSONs). Built with Next.js, TransEdit provides a portable workflow for translators and developers to manage multilingual content efficiently.

## ✨ Features

- **Upload & Generate**: Upload source and target language JSON files to create a `.transedit` review file
- **Review Dashboard**: Interactive interface for editing translations with real-time autosave
- **Undo & Snapshots**: Full undo/redo functionality and snapshot management for version control
- **Search & Filter**: Powerful search and filtering capabilities across translations
- **Export**: Export updated locale JSON files after review
- **Share Reviews**: Generate shareable links via Catbox for easy collaboration
- **Local-First**: All operations happen locally in the browser using IndexedDB—no server required
- **Modern UI**: Beautiful interface built with shadcn/ui, Lucide icons, and Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [Dexie](https://dexie.org/) for IndexedDB
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **State Management**: [TanStack Query](https://tanstack.com/query) for async operations
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes) for dark/light mode
- **Sharing**: [node-catbox](https://www.npmjs.com/package/node-catbox) for file hosting
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) for toast notifications

## 🚀 Installation

### Prerequisites

- Node.js 18+ and pnpm

````markdown
# TransEdit

TransEdit is a small, local-first Next.js app for reviewing and editing translation (locale) JSON files.

Key features

- Upload source (e.g. `en.json`) and target locale files to create a `.transedit` review file.
- Interactive review dashboard with autosave and undo/redo.
- Snapshot support to capture versions while reviewing.
- Search and filter translations.
- Export updated locale JSON files.
- Share reviews by uploading the `.transedit` file to Catbox and generating a short share link (`/review?shareId=...`).
- Local storage via IndexedDB (Dexie); no remote database required for core functionality.

Quick start

1. Install dependencies and run the dev server (pnpm preferred):

```bash
pnpm install
pnpm dev
```

2. Open http://localhost:3000 and use the Create page to import files or the Review page to open a `.transedit` file.

Notes

- The app uses Catbox to host shared `.transedit` files when you generate share links. Shared links fetch the review file server-side and merge any existing local progress.
- This repository is primarily for personal use and experimentation; the README is intentionally minimal.

````
2. Use the search bar to find specific translations
