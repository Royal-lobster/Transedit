"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ActionsBar } from "./_components/actions-bar";
import { KeysTree } from "./_components/keys-tree";
import { ReviewMetaBar } from "./_components/review-meta-bar";
import { ReviewSkeleton } from "./_components/review-skeleton";
import { SearchBar } from "./_components/search-bar";
import { TranslationsList } from "./_components/translations-list";
import { useReview } from "./_hooks/use-review";

interface ReviewContextType {
	form: ReturnType<typeof useReview>["form"];
	model: ReturnType<typeof useReview>["model"];
	keys: ReturnType<typeof useReview>["keys"];
	filteredIndices: ReturnType<typeof useReview>["filteredIndices"];
	reviewStats: ReturnType<typeof useReview>["reviewStats"];
	verified: ReturnType<typeof useReview>["verified"];
	isVerified: ReturnType<typeof useReview>["isVerified"];
	setVerifiedByIndex: ReturnType<typeof useReview>["setVerifiedByIndex"];
	onDownloadLocale: ReturnType<typeof useReview>["onDownloadLocale"];
	onDownloadTransedit: ReturnType<typeof useReview>["onDownloadTransedit"];
	onCopyShareLink: ReturnType<typeof useReview>["onCopyShareLink"];
	isSharing: ReturnType<typeof useReview>["isSharing"];
	liveStats: ReturnType<typeof useReview>["liveStats"];
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
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const searchParams = useSearchParams();
	const id = searchParams.get("id") ?? undefined;
	const shareId = searchParams.get("shareId") ?? undefined;
	const hasParams = !!id || !!shareId;
	const reviewData = useReview({ id });

	return (
		<div className="w-full">
			<Form {...reviewData.form}>
				<ReviewContext.Provider value={reviewData}>
					{!mounted || reviewData.isLoading ? (
						<ReviewSkeleton />
					) : reviewData.isError ? (
						<NoReviewState
							title="Couldn&apos;t open review"
							description={
								(reviewData.error as Error | undefined)?.message ||
								"Try opening it again from the landing page or your saved list."
							}
						/>
					) : !hasParams ? (
						<NoReviewState
							title="No review loaded"
							description="Open a .transedit file from the landing page or choose one from Your reviews."
						/>
					) : !reviewData.model ? (
						<ReviewSkeleton />
					) : (
						<div className="space-y-6">
							<ReviewTopBar />
							<ReviewContent />
						</div>
					)}
				</ReviewContext.Provider>
			</Form>
		</div>
	);
}

function ReviewTopBar() {
	const {
		form,
		model,
		onDownloadLocale,
		onDownloadTransedit,
		onCopyShareLink,
		isSharing,
	} = useReviewContext();

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
					onDownloadTransedit={onDownloadTransedit}
					onCopyShareLink={onCopyShareLink}
					isSharing={isSharing}
				/>
			</div>
		</div>
	);
}

// Review skeleton extracted to ./_components/review-skeleton

function NoReviewState({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="rounded-xl border p-6">
			<div className="space-y-1">
				<div className="text-sm font-medium">{title}</div>
				<div className="text-sm text-muted-foreground">{description}</div>
			</div>
		</div>
	);
}

function ReviewContent() {
	const {
		keys,
		filteredIndices,
		form,
		model,
		liveStats,
		reviewStats,
		isVerified,
		setVerifiedByIndex,
	} = useReviewContext();

	const [tab, setTab] = useState<"todo" | "verified">("todo");
	const scrollApiRef = useRef<{ scrollToIndex: (i: number) => void } | null>(
		null,
	);

	if (!model) return null;

	return (
		<div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px]">
			<Card className="overflow-visible bg-transparent border-none shadow-none">
				<CardHeader className="pb-2 !px-0">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base">Translations</CardTitle>
						<Badge variant="outline" className="text-xs">
							Auto saving
						</Badge>
					</div>
					<div className="mt-3">
						<ToggleGroup
							type="single"
							value={tab}
							onValueChange={(v) => v && setTab(v as "todo" | "verified")}
							className=""
							variant="outline"
							aria-label="Review filter"
						>
							<ToggleGroupItem value="todo">To review</ToggleGroupItem>
							<ToggleGroupItem value="verified">Verified</ToggleGroupItem>
						</ToggleGroup>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<div className="h-full">
						{filteredIndices.length === 0 ? (
							<p className="text-sm text-muted-foreground">No matches.</p>
						) : (
							<TranslationsList
								keys={keys}
								filteredIndices={filteredIndices}
								control={form.control}
								enDict={model.en}
								isVerified={isVerified}
								setVerifiedByIndex={setVerifiedByIndex}
								showTab={tab}
								onRegisterScrollApi={(api) => {
									scrollApiRef.current = api;
								}}
							/>
						)}
						<p className="mt-4 text-xs text-muted-foreground">
							Edits auto-save locally. Undo/redo supported via your
							browser&apos;s standard shortcuts.
						</p>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-4 lg:sticky lg:top-36 lg:self-start order-first lg:order-last">
				<ReviewMetaBar
					sourceLang={model.meta.sourceLang}
					targetLang={model.meta.targetLang}
					title={model.meta.title}
					projectId={model.id}
					percent={liveStats.percent}
					translated={liveStats.translated}
					total={liveStats.total}
					reviewPercent={reviewStats.percent}
					reviewed={reviewStats.reviewed}
				/>
				<KeysTree
					keys={keys.filter((_, i) =>
						tab === "verified" ? isVerified(i) : !isVerified(i),
					)}
					// Use virtualization-aware navigation when available
					onSelect={(key: string) => {
						const idx = keys.indexOf(key);
						if (idx < 0) return;
						if (scrollApiRef.current) scrollApiRef.current.scrollToIndex(idx);
						else {
							// Fallback to default hash/offset scrolling
							const el = document.getElementById(`tr-${idx}`);
							if (!el) return;
							const appHeader = document.querySelector(
								"header.sticky",
							) as HTMLElement | null;
							const topBar = document.getElementById("review-topbar");
							const stickyOffset =
								(appHeader?.offsetHeight ?? 0) +
								(topBar?.offsetHeight ?? 0) +
								8;
							const y =
								el.getBoundingClientRect().top + window.scrollY - stickyOffset;
							window.scrollTo({ top: y, behavior: "smooth" });
						}
					}}
				/>
			</div>
		</div>
	);
}
