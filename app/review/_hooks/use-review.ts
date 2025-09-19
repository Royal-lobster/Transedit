"use client";

import { useMemo } from "react";
import { useCreateShareLink } from "@/app/create/_hooks/use-create-share-link";
import type { TransEditFile } from "@/lib/helpers/transedit";
import { useReviewLoader } from "./use-review-loader";
import { useTranslationsForm } from "./use-translations-form";

export type ReviewFormValues = {
	translations: string[];
	search: string;
	note?: string;
};

export function useReview(opts?: { id?: string | null; data?: string | null }) {
	// Load model and handle URL normalization
	const { model, isLoading, isError, error } = useReviewLoader(opts);

	// Form, filtering, autosave, downloads
	const {
		form,
		keys,
		filteredIndices,
		liveStats,
		reviewStats,
		verified,
		isVerified,
		setVerifiedByIndex,
		onDownloadLocale,
		onDownloadTransedit,
	} = useTranslationsForm(model as TransEditFile | null);

	// Provide a way for share hook to get the current snapshot
	const currentSnapshot = useMemo(() => {
		if (!model) return null;
		const arr = form.getValues("translations") ?? [];
		const map: Record<string, string> = {};
		const sortedKeys = model ? Object.keys(model.en).sort() : [];
		for (let i = 0; i < sortedKeys.length; i++)
			map[sortedKeys[i]] = String(arr[i] ?? "");
		return { ...model, target: map } as TransEditFile;
	}, [form, model]);

	// Share link generation
	const { createShareLinkWithToast, isPending: isSharing } =
		useCreateShareLink();
	const onCopyShareLink = () => {
		if (!currentSnapshot) return;
		return createShareLinkWithToast(currentSnapshot, { autoCopy: true });
	};

	return {
		form,
		model,
		keys,
		filteredIndices,
		reviewStats,
		verified,
		isVerified,
		setVerifiedByIndex,
		onDownloadLocale,
		onDownloadTransedit,
		onCopyShareLink,
		isSharing,
		liveStats,
		isLoading,
		isError,
		error,
	} as const;
}
