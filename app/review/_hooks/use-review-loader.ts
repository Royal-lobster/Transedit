"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { loadProject, upsertProject } from "@/lib/db";
import { mergeProgress, type TransEditFile, validateTransEdit } from "@/lib/helpers/transedit";

export function useReviewLoader(opts?: { id?: string | null; data?: string | null }) {
	const idParam = opts?.id ?? null;
	const shareIdParam =
		typeof window !== "undefined"
			? new URLSearchParams(window.location.search).get("shareId")
			: null;

	const query = useQuery<TransEditFile, Error, TransEditFile, (string | null)[]>({
		queryKey: ["review", idParam, shareIdParam],
		enabled: !!idParam || !!shareIdParam,
		queryFn: async () => {
			// Load via shareId (Catbox proxy)
			if (shareIdParam) {
				const res = await fetch(
					`/api/share/${encodeURIComponent(shareIdParam)}`,
				);
				if (!res.ok) throw new Error(`Failed to fetch share (${res.status})`);
				const obj = (await res.json()) as unknown;
				try {
					validateTransEdit(obj);
				} catch {
					throw new Error("Invalid shared review file");
				}
				const fromShared = obj as TransEditFile;
				const prior = await loadProject(fromShared.id);
				const merged = prior
					? mergeProgress(fromShared, prior.target)
					: fromShared;
				await upsertProject({
					id: merged.id,
					meta: merged.meta,
					en: merged.en,
					target: merged.target,
					updatedAt: new Date().toISOString(),
				});
				return merged;
			}

			if (idParam) {
				const prior = await loadProject(idParam);
				if (!prior) throw new Error("Review not found");
				const merged = {
					id: prior.id,
					meta: prior.meta,
					en: prior.en,
					target: prior.target,
				} as TransEditFile;
				return merged;
			}

			throw new Error("Invalid review link");
		},
	});

	// Normalize URL to ?id=<id> when coming from shareId
	useEffect(() => {
		if (typeof window === "undefined") return;
		const data = query.data;
		if (!data) return;
		const params = new URLSearchParams(window.location.search);
		const hasShareId = params.has("shareId");
		if (hasShareId) {
			if (hasShareId) params.delete("shareId");
			params.set("id", data.id);
			const newQs = params.toString();
			const newUrl = `${location.origin}${location.pathname}${newQs ? `?${newQs}` : ""}`;
			window.history.replaceState(null, "", newUrl);
		}
	}, [query.data]);

	return {
		model: (query.data ?? null) as TransEditFile | null,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	} as const;
}
