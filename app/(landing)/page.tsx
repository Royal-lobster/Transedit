"use client";

import { Edit3, FileDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ReviewsDashboard } from "./_components/reviews-dashboard";

export default function Home() {
	return (
		<div>
			<section className="mb-8">
				<p className="text-muted-foreground">
					Upload translation files to generate a portable review file
					(.transedit) or open a review dashboard to edit and export updated
					locale JSON. No server or database required — everything happens
					locally in your browser.
				</p>
			</section>

			<div className="grid gap-6 sm:grid-cols-2">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<FileDown className="h-4 w-4" /> Create review request
						</CardTitle>
						<CardDescription>
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
						<CardTitle className="flex items-center gap-2 text-base">
							<Edit3 className="h-4 w-4" /> Review translations
						</CardTitle>
						<CardDescription>
							Upload a .transedit file to edit translations with autosave, undo,
							and snapshots. Export the locale JSON.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline" className="w-full gap-2">
							<Link href="/review">
								<Edit3 className="h-4 w-4" />
								Open review dashboard
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			<div className="mt-8">
				<ReviewsDashboard />
			</div>

			<footer className="mt-10 text-xs text-muted-foreground">
				Dark themed UI with shadcn components, lucide icons, and local IndexedDB
				storage (Dexie).
			</footer>
		</div>
	);
}
