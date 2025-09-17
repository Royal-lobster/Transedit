"use client";

import { Edit3, FileDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<div className="min-h-screen w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
			<div className="mx-auto max-w-4xl px-6 py-16">
				<header className="mb-12 flex items-center gap-3">
					<Sparkles className="h-7 w-7 text-fuchsia-400" />
					<h1 className="text-3xl font-semibold tracking-tight">TransEdit</h1>
				</header>

				<section className="mb-10">
					<p className="text-zinc-300">
						Upload translation files to generate a portable review file
						(.transedit) or open a review dashboard to edit and export updated
						locale JSON. No server or database required — everything happens
						locally in your browser.
					</p>
				</section>

				<div className="grid gap-6 sm:grid-cols-2">
					<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur">
						<div className="mb-4 flex items-center gap-3">
							<FileDown className="h-5 w-5 text-fuchsia-400" />
							<h2 className="text-lg font-medium">Create review request</h2>
						</div>
						<p className="mb-6 text-sm text-zinc-400">
							Provide en.json and optional locale.json to generate a sharable
							.transedit file for reviewers.
						</p>
						<Button asChild className="w-full gap-2">
							<Link href="/create">
								<FileDown className="h-4 w-4" />
								Create .transedit
							</Link>
						</Button>
					</div>

					<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur">
						<div className="mb-4 flex items-center gap-3">
							<Edit3 className="h-5 w-5 text-sky-400" />
							<h2 className="text-lg font-medium">Review translations</h2>
						</div>
						<p className="mb-6 text-sm text-zinc-400">
							Upload a .transedit file to edit translations with autosave, undo,
							and snapshots. Export the locale JSON.
						</p>
						<Button asChild variant="outline" className="w-full gap-2">
							<Link href="/review">
								<Edit3 className="h-4 w-4" />
								Open review dashboard
							</Link>
						</Button>
					</div>
				</div>

				<footer className="mt-14 text-xs text-zinc-500">
					Dark themed UI with shadcn components, lucide icons, and local
					IndexedDB storage (Dexie).
				</footer>
			</div>
		</div>
	);
}
