"use client";

import { Undo2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useReview } from "../_hooks/use-review";
import { ActionsBar } from "./actions-bar";
import { ReviewMetaBar } from "./review-meta-bar";
import { ReviewUploader } from "./review-uploader";
import { SearchBar } from "./search-bar";
import { SnapshotsPanel } from "./snapshots-panel";
import { TranslationsList } from "./translations-list";

export function ReviewClient() {
	const {
		form,
		model,
		snapshots,
		error,
		keys,
		filteredIndices,
		onSaveSnapshot,
		onDownloadLocale,
		liveStats,
		pickFileAndLoad,
	} = useReview();

	return (
		<Form {...form}>
			{!model ? (
				<ReviewUploader
					control={form.control}
					error={error}
					onPick={pickFileAndLoad}
				/>
			) : (
				<div className="space-y-6">
					<ReviewMetaBar
						sourceLang={model.meta.sourceLang}
						targetLang={model.meta.targetLang}
						projectId={model.id}
						percent={liveStats.percent}
						translated={liveStats.translated}
						total={liveStats.total}
					/>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<SearchBar control={form.control} />
						<ActionsBar
							targetLang={model.meta.targetLang}
							onSaveSnapshot={onSaveSnapshot}
							onDownloadLocale={onDownloadLocale}
							onTransFileChange={async (file) => {
								await pickFileAndLoad(file);
							}}
						/>
					</div>

					<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
						<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
							{filteredIndices.length === 0 ? (
								<p className="text-sm text-zinc-400">No matches.</p>
							) : (
								<TranslationsList
									keys={keys}
									filteredIndices={filteredIndices}
									control={form.control}
									enDict={model.en}
								/>
							)}
							<p className="mt-4 text-xs text-zinc-500">
								Edits auto-save locally. Undo/redo supported via your browser's
								standard shortcuts.
							</p>
						</div>

						<aside className="space-y-4">
							<SnapshotsPanel
								control={form.control}
								snapshots={snapshots}
								onSaveSnapshot={onSaveSnapshot}
							/>

							<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
								<Button asChild variant="outline" className="w-full gap-2">
									<Link href="/">
										<Undo2 className="h-4 w-4" />
										Back to Home
									</Link>
								</Button>
							</div>
						</aside>
					</div>
				</div>
			)}
		</Form>
	);
}
