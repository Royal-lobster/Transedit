"use client";

import { createContext, useCallback, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ActionsBar } from "./_components/actions-bar";
import { KeysTree } from "./_components/keys-tree";
import { ReviewMetaBar } from "./_components/review-meta-bar";
import { ReviewUploader } from "./_components/review-uploader";
import { SearchBar } from "./_components/search-bar";
import { TranslationsList } from "./_components/translations-list";
import { useReview } from "./_hooks/use-review";

interface ReviewContextType {
	form: ReturnType<typeof useReview>["form"];
	model: ReturnType<typeof useReview>["model"];
	error: ReturnType<typeof useReview>["error"];
	keys: ReturnType<typeof useReview>["keys"];
	filteredIndices: ReturnType<typeof useReview>["filteredIndices"];
	onDownloadLocale: ReturnType<typeof useReview>["onDownloadLocale"];
	liveStats: ReturnType<typeof useReview>["liveStats"];
	pickFileAndLoad: ReturnType<typeof useReview>["pickFileAndLoad"];
}

const ReviewContext = createContext<ReviewContextType | null>(null);

function useReviewContext() {
	const context = useContext(ReviewContext);
	if (!context) {
		throw new Error("useReviewContext must be used within a ReviewProvider");
	}
	return context;
}

export default function ReviewPage() {
	const reviewData = useReview();
	const scrollToKey = useCallback(
		(key: string) => {
			const idx = reviewData.keys.indexOf(key);
			if (idx < 0) return;
			const el = document.getElementById(`tr-${idx}`);
			if (!el) return;
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
			const appHeader = document.querySelector(
				"header.sticky",
			) as HTMLElement | null;
			const topBar = document.getElementById("review-topbar");
			const stickyOffset =
				(appHeader?.offsetHeight ?? 0) + (topBar?.offsetHeight ?? 0) + 8;
			const y = el.getBoundingClientRect().top + window.scrollY - stickyOffset;
			window.scrollTo({ top: y, behavior: "smooth" });
		},
		[reviewData.keys],
	);

	return (
		<div className="w-full">
			<Form {...reviewData.form}>
				<ReviewContext.Provider value={reviewData}>
					{!reviewData.model ? (
						<ReviewUploaderSection />
					) : (
						<div className="space-y-6">
							<ReviewTopBar />
							<ReviewContent onSelect={scrollToKey} />
						</div>
					)}
				</ReviewContext.Provider>
			</Form>
		</div>
	);
}

function ReviewUploaderSection() {
	const { form, error, pickFileAndLoad } = useReviewContext();

	return (
		<Card>
			<CardContent className="p-6">
				<ReviewUploader
					control={form.control}
					error={error}
					onPick={pickFileAndLoad}
				/>
			</CardContent>
		</Card>
	);
}

function ReviewTopBar() {
	const { form, model, onDownloadLocale, pickFileAndLoad } = useReviewContext();

	if (!model) return null;

	return (
		<div
			id="review-topbar"
			className="sticky -mt-20 mb-20 top-14 z-20 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
		>
			<div className="py-3 flex flex-row items-center justify-between gap-3">
				<SearchBar control={form.control} />
				<ActionsBar
					targetLang={model.meta.targetLang}
					onDownloadLocale={onDownloadLocale}
					onTransFileChange={pickFileAndLoad}
				/>
			</div>
		</div>
	);
}

function ReviewContent({ onSelect }: { onSelect: (key: string) => void }) {
	const { keys, filteredIndices, form, model, liveStats } = useReviewContext();

	if (!model) return null;

	return (
		<div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px]">
			<Card className="overflow-hidden">
				<CardHeader className="pb-2">
					<CardTitle className="text-base">Translations</CardTitle>
				</CardHeader>
				<CardContent className="p-4">
					<div className="h-full">
						{filteredIndices.length === 0 ? (
							<p className="text-sm text-muted-foreground">No matches.</p>
						) : (
							<TranslationsList
								keys={keys}
								filteredIndices={filteredIndices}
								control={form.control}
								enDict={model.en}
							/>
						)}
						<p className="mt-4 text-xs text-muted-foreground">
							Edits auto-save locally. Undo/redo supported via your browser's
							standard shortcuts.
						</p>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-4 lg:sticky lg:top-36 lg:self-start order-first lg:order-last">
				<ReviewMetaBar
					sourceLang={model.meta.sourceLang}
					targetLang={model.meta.targetLang}
					projectId={model.id}
					percent={liveStats.percent}
					translated={liveStats.translated}
					total={liveStats.total}
				/>
				<KeysTree keys={keys} onSelect={onSelect} />
			</div>
		</div>
	);
}
