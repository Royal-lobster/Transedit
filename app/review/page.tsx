"use client";
import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ActionsBar } from "./_components/actions-bar";
import { KeysTree } from "./_components/keys-tree";
import { ReviewMetaBar } from "./_components/review-meta-bar";
import { ReviewUploader } from "./_components/review-uploader";
import { SearchBar } from "./_components/search-bar";
import { TranslationsList } from "./_components/translations-list";
import { useReview } from "./_hooks/useReview";

export default function ReviewPage() {
	const {
		form,
		model,
		error,
		keys,
		filteredIndices,
		onDownloadLocale,
		liveStats,
		pickFileAndLoad,
	} = useReview();

	const scrollToKey = useCallback(
		(key: string) => {
			// find index from keys (sorted)
			const idx = keys.indexOf(key);
			if (idx < 0) return;
			const el = document.getElementById(`tr-${idx}`);
			if (!el) return;
			// Try to find the nearest ScrollArea viewport and scroll within it (legacy)
			const viewport = el.closest(
				'[data-slot="scroll-area-viewport"]',
			) as HTMLElement | null;
			if (viewport) {
				const targetTop = el.getBoundingClientRect().top;
				const vpTop = viewport.getBoundingClientRect().top;
				const offset = targetTop - vpTop + viewport.scrollTop - 8;
				viewport.scrollTo({ top: offset, behavior: "smooth" });
				return;
			}
			// Default: browser scroll with offset to account for sticky header + top bar
			const appHeader = document.querySelector(
				"header.sticky",
			) as HTMLElement | null;
			const topBar = document.getElementById("review-topbar");
			const stickyOffset =
				(appHeader?.offsetHeight ?? 0) + (topBar?.offsetHeight ?? 0) + 8;
			const y = el.getBoundingClientRect().top + window.scrollY - stickyOffset;
			window.scrollTo({ top: y, behavior: "smooth" });
		},
		[keys],
	);

	return (
		<div className="w-full">
			<Form {...form}>
				{!model ? (
					<Card>
						<CardContent className="p-6">
							<ReviewUploader
								control={form.control}
								error={error}
								onPick={pickFileAndLoad}
							/>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-6">
						{/* Sticky top bar under the app header */}
						<div
							id="review-topbar"
							className="sticky -mt-20 mb-20 top-14 z-20 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
						>
							<div className="py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<SearchBar control={form.control} />
								<ActionsBar
									targetLang={model.meta.targetLang}
									onDownloadLocale={onDownloadLocale}
									onTransFileChange={async (file) => {
										await pickFileAndLoad(file);
									}}
								/>
							</div>
						</div>

						<div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_320px]">
							<Card className="overflow-hidden">
								<CardHeader className="pb-2">
									<CardTitle className="text-base">Translations</CardTitle>
								</CardHeader>
								<CardContent className="p-4">
									<div className="h-full">
										{filteredIndices.length === 0 ? (
											<p className="text-sm text-muted-foreground">
												No matches.
											</p>
										) : (
											<TranslationsList
												keys={keys}
												filteredIndices={filteredIndices}
												control={form.control}
												enDict={model.en}
											/>
										)}
										<p className="mt-4 text-xs text-muted-foreground">
											Edits auto-save locally. Undo/redo supported via your
											browser's standard shortcuts.
										</p>
									</div>
								</CardContent>
							</Card>

							<div className="space-y-4 xl:sticky xl:top-36 xl:self-start">
								<ReviewMetaBar
									sourceLang={model.meta.sourceLang}
									targetLang={model.meta.targetLang}
									projectId={model.id}
									percent={liveStats.percent}
									translated={liveStats.translated}
									total={liveStats.total}
								/>
								<KeysTree keys={keys} onSelect={scrollToKey} />
							</div>
						</div>
					</div>
				)}
			</Form>
		</div>
	);
}
