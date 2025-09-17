# TransEdit

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

TransEdit is a local-first Next.js application for reviewing and editing translation (locale) JSON files. It's designed for translators and developers who want a portable, browser-based workflow with offline persistence and easy sharing.

## Features

- Upload source and target locale JSON files to generate a `.transedit` review bundle
- Interactive review dashboard with autosave, undo/redo and snapshots
- Search and filter translations
- Export updated locale JSON files after review
- Share reviews by uploading the `.transedit` file to Catbox and generating a short share link (`/review?shareId=...`)
- IndexedDB (Dexie) for local persistence — no server or external database required for the main workflow

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Dexie (IndexedDB)
- React Hook Form + Zod
- TanStack Query
- Sonner (toasts)

## Quick start

Prerequisites: Node.js 18+ and pnpm

1. Install dependencies

```bash
pnpm install
```

2. Run the development server

```bash
pnpm dev
```

3. Open the app

Visit http://localhost:3000. Use the Create page to import source/target JSON files or the Review page to open a `.transedit` file.

## Sharing behavior

There are two ways to share a `.transedit` review with another reviewer:

1. Direct file download

	- Export and download the `.transedit` file from the app and send it to the reviewer (e.g., email, Slack, or your preferred file transfer). The reviewer can then open the Review page and import the file locally. This keeps sharing private and doesn't require any third-party hosting.

2. Create a share link (Catbox)

	- The app can upload the `.transedit` file to Catbox (catbox.moe) and generate a short share link (`/review?shareId=...`). This is convenient for quick, temporary public sharing. When a reviewer opens a shared link, the review file is fetched server-side and any local progress stored in the reviewer's browser is merged.

Considerations:

- Direct download = private, no external hosting, manual distribution.
- Catbox share link = convenient and quick, but temporary and hosted by a third party (review Catbox's retention/privacy if that matters).

## Notes

- This repository is primarily for personal use and experimentation. The README focuses on the essentials.
- If you plan to run this publicly, review the Catbox usage and consider an alternative hosting solution for persistence and privacy.

## License

MIT
