"use client";

import { Edit3, FileDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { buildShareUrl, parseTransEditUpload } from "@/lib/helpers/transedit";
import { ReviewsDashboard } from "./_components/reviews-dashboard";

export default function Home() {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handlePick = async (file: File) => {
		setError(null);
		try {
			const model = await parseTransEditUpload(file);
			const url = buildShareUrl(model);
			window.location.href = url;
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			setError(msg);
		}
	};

	return (
		<div>
			<section className="mb-6 sm:mb-8">
				<p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
					Upload translation files to generate a portable review file
					(.transedit) or open a review dashboard to edit and export updated
					locale JSON. No server or database required — everything happens
					locally in your browser.
				</p>
			</section>

			<div className="grid gap-6 sm:grid-cols-2">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-sm sm:text-base">
							<FileDown className="h-4 w-4" /> Create review request
						</CardTitle>
						<CardDescription className="text-xs sm:text-sm">
							Provide en.json and optional locale.json to generate a sharable
							.transedit file for reviewers.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild className="w-full gap-2">
							<Link href="/create">
								<FileDown className="h-4 w-4" />
								Create .transedit
							</Link>
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-sm sm:text-base">
							<Edit3 className="h-4 w-4" /> Review translations
						</CardTitle>
						<CardDescription className="text-xs sm:text-sm">
							Upload a .transedit file to edit translations with autosave, undo,
							and snapshots. Export the locale JSON.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Sheet open={open} onOpenChange={setOpen}>
							<Button
								variant="outline"
								className="w-full gap-2"
								onClick={() => setOpen(true)}
							>
								<Edit3 className="h-4 w-4" /> Import .transedit
							</Button>
							<SheetContent side="bottom">
								<SheetHeader>
									<SheetTitle>Open .transedit</SheetTitle>
									<SheetDescription>
										Choose a .transedit file to open the review dashboard. Your
										edits will auto-save locally.
									</SheetDescription>
								</SheetHeader>
								<div className="p-4 pt-0">
									<Input
										type="file"
										accept=".transedit,application/json"
										onChange={async (e) => {
											const f = e.target.files?.[0] ?? null;
											if (!f) return;
											await handlePick(f);
											e.currentTarget.value = "";
										}}
									/>
									{error && (
										<div className="mt-3 rounded-md border bg-destructive/10 border-destructive/30 p-3 text-sm text-destructive">
											{error}
										</div>
									)}
								</div>
							</SheetContent>
						</Sheet>
					</CardContent>
				</Card>
			</div>

			<div className="mt-8">
				<ReviewsDashboard />
			</div>

			<footer className="mt-8 sm:mt-10 text-xs text-muted-foreground">
				Dark themed UI with shadcn components, lucide icons, and local IndexedDB
				storage (Dexie).
			</footer>
		</div>
	);
}
