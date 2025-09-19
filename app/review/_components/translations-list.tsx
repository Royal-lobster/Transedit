"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Check, CheckCircle, Edit, Globe } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewFormValues } from "../_hooks/use-review";

type TranslationsListProps = {
	keys: string[];
	filteredIndices: number[] | null;
	control: Control<ReviewFormValues>;
	enDict: Record<string, string>;
	isVerified: (index: number) => boolean;
	setVerifiedByIndex: (index: number, value: boolean) => void;
	showTab: "todo" | "verified";
	onRegisterScrollApi?: (api: {
		scrollToIndex: (index: number) => void;
	}) => void;
};

export function TranslationsList({
	keys,
	filteredIndices,
	control,
	enDict,
	isVerified,
	setVerifiedByIndex,
	showTab,
	onRegisterScrollApi,
}: TranslationsListProps) {
	const indices = (filteredIndices ?? keys.map((_, i) => i)).filter((i) =>
		showTab === "verified" ? isVerified(i) : !isVerified(i),
	);

	// Virtualization hooks must be declared unconditionally
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [scrollMargin, setScrollMargin] = useState(0);

	// Measure the list container's offset from the top of the document for window virtualization
	useLayoutEffect(() => {
		const compute = () => {
			const el = containerRef.current;
			if (!el) return;
			const top = el.getBoundingClientRect().top + window.scrollY;
			setScrollMargin(top);
		};
		compute();
		window.addEventListener("resize", compute);
		return () => window.removeEventListener("resize", compute);
	}, []);
	const rowCount = indices.length;
	const estimateSize = useMemo(() => 220, []); // avg card height
	const rowVirtualizer = useWindowVirtualizer({
		count: rowCount,
		estimateSize: () => estimateSize,
		overscan: 8,
		scrollMargin,
		// Let the virtualizer measure real DOM heights so variable-height cards don't overlap
		measureElement: (el) => (el as HTMLElement).getBoundingClientRect().height,
	});

	// Expose a stable scrollToIndex API to parent components (e.g., KeysTree)
	useLayoutEffect(() => {
		if (!onRegisterScrollApi) return;
		const scrollToIndex = (index: number) => {
			// First, ask the virtualizer to bring the item into view
			rowVirtualizer.scrollToIndex(index, { align: "start" });
			// Then in the next frame, compensate for sticky headers so the card isn't hidden
			requestAnimationFrame(() => {
				const el = document.getElementById(`tr-${index}`);
				if (!el) return;
				const appHeader = document.querySelector(
					"header.sticky",
				) as HTMLElement | null;
				const topBar = document.getElementById("review-topbar");
				const stickyOffset =
					(appHeader?.offsetHeight ?? 0) + (topBar?.offsetHeight ?? 0) + 8;
				const top = el.getBoundingClientRect().top;
				const delta = top - stickyOffset;
				if (Math.abs(delta) > 1) {
					window.scrollBy({ top: delta, left: 0, behavior: "smooth" });
				}

				// Brief highlight effect to draw attention to the card
				// Clear any previous highlight
				document
					.querySelectorAll(".tr-highlight")
					.forEach((n) =>
						n.classList.remove(
							"tr-highlight",
							"ring-2",
							"ring-primary",
							"ring-offset-2",
							"ring-offset-background",
						),
					);
				// Apply highlight
				el.classList.add(
					"tr-highlight",
					"ring-2",
					"ring-primary",
					"ring-offset-2",
					"ring-offset-background",
				);
				window.setTimeout(() => {
					el.classList.remove(
						"tr-highlight",
						"ring-2",
						"ring-primary",
						"ring-offset-2",
						"ring-offset-background",
					);
				}, 1200);
			});
		};
		onRegisterScrollApi({ scrollToIndex });
	}, [onRegisterScrollApi, rowVirtualizer]);

	// If search produced no matches at all, show that first
	if ((filteredIndices?.length ?? 0) === 0) {
		return <p className="text-sm text-muted-foreground">No matches.</p>;
	}

	if (indices.length === 0) {
		// Nice empty states per tab
		return (
			<div className="flex flex-col items-center justify-center gap-2 rounded-md border p-6 text-center">
				{showTab === "todo" ? (
					<>
						<CheckCircle className="h-6 w-6 text-primary" />
						<p className="text-sm font-medium">All reviewed</p>
						<p className="text-xs text-muted-foreground">
							Everything here is verified. Switch to the Verified tab to see
							them.
						</p>
					</>
				) : (
					<>
						<Check className="h-6 w-6 text-muted-foreground" />
						<p className="text-sm font-medium">No verified items yet</p>
						<p className="text-xs text-muted-foreground">
							Mark translations as Verified to collect them here.
						</p>
					</>
				)}
			</div>
		);
	}

	return (
		<div ref={containerRef}>
			<div
				style={{
					height: rowVirtualizer.getTotalSize(),
					width: "100%",
					position: "relative",
				}}
			>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => {
					const idx = indices[virtualRow.index];
					const key = keys[idx];
					const en = enDict[key] ?? "";
					return (
						<div
							key={virtualRow.key}
							data-index={virtualRow.index}
							ref={rowVirtualizer.measureElement}
							className="absolute left-0 top-0 w-full px-0 p-2"
							style={{
								transform: `translateY(${
									virtualRow.start - (rowVirtualizer.options.scrollMargin ?? 0)
								}px)`,
								willChange: "transform",
							}}
						>
							<TranslationCard
								translationKey={key}
								enText={en}
								index={idx}
								control={control}
								verified={isVerified(idx)}
								onToggleVerified={() =>
									setVerifiedByIndex(idx, !isVerified(idx))
								}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}

type TranslationCardProps = {
	translationKey: string;
	enText: string;
	index: number;
	control: Control<ReviewFormValues>;
	verified: boolean;
	onToggleVerified: () => void;
};

function TranslationCard({
	translationKey,
	enText,
	index,
	control,
	verified,
	onToggleVerified,
}: TranslationCardProps) {
	return (
		<Card
			id={`tr-${index}`}
			className="shadow-sm hover:shadow-md transition-shadow"
		>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center justify-between text-sm font-medium">
					<span className="break-words max-w-[60vw] pr-2">
						{translationKey}
					</span>
					<div className="flex items-center gap-3">
						{(() => {
							const checkboxId = `verified-${index}`;
							return (
								<>
									<Checkbox
										id={checkboxId}
										checked={verified}
										onCheckedChange={() => onToggleVerified()}
										aria-label={verified ? "Unverify" : "Mark as verified"}
									/>
									<label
										htmlFor={checkboxId}
										className="text-xs text-muted-foreground cursor-pointer select-none"
									>
										Verified
									</label>
								</>
							);
						})()}
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-start space-x-3">
					<Globe className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
					<div className="flex-1 min-w-0">
						<p className="text-xs text-muted-foreground mb-1">English</p>
						<p className="text-sm text-foreground break-words">{enText}</p>
					</div>
				</div>
				<FormField
					control={control}
					name={`translations.${index}` as const}
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center text-xs text-muted-foreground mb-2">
								<Edit className="w-3 h-3 mr-1" />
								Translation
							</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Enter translation..."
									className="min-h-[100px] resize-none text-base leading-relaxed"
									value={(field.value as string) ?? ""}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	);
}
