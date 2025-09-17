"use client";

import { Edit3 } from "lucide-react";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { upsertProject } from "@/lib/db";
import { parseTransEditUpload } from "@/lib/helpers/transedit";
import { ImportDialog } from "./import-dialog";

export function ReviewTranslationsCard() {
	const [error, setError] = useState<string | null>(null);
	const [importing, setImporting] = useState(false);

	const handlePick = async (file: File) => {
		setError(null);
		setImporting(true);
		try {
			const model = await parseTransEditUpload(file);
			// Save to Dexie so it shows up in the dashboard and can be revisited
			await upsertProject({
				id: model.id,
				meta: model.meta,
				en: model.en,
				target: model.target,
				updatedAt: new Date().toISOString(),
			});
			// Navigate to review using id flow
			window.location.href = `/review?id=${encodeURIComponent(model.id)}`;
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			setError(msg);
		} finally {
			setImporting(false);
		}
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-sm sm:text-base">
					<Edit3 className="h-4 w-4" /> Review translations
				</CardTitle>
				<CardDescription className="text-xs sm:text-sm">
					Upload a .transedit file to edit translations with autosave, undo, and
					snapshots. Export the locale JSON.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<ImportDialog importing={importing} error={error} onPick={handlePick} />
			</CardContent>
		</Card>
	);
}
