"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { type TransEditFile, toTransEditJson } from "@/lib/helpers/transedit";

export function useShareLink(
	model: TransEditFile | null,
	getCurrentTarget: () => TransEditFile | null,
) {
	const shareMutation = useMutation({
		mutationFn: async () => {
			const current = getCurrentTarget();
			if (!current) throw new Error("No review loaded");
			const res = await fetch("/api/share", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: toTransEditJson(current),
			});
			if (!res.ok) {
				const j = await res.json().catch(() => ({ error: res.statusText }));
				throw new Error(j.error || `Upload failed (${res.status})`);
			}
			const data = (await res.json()) as { id: string; url: string };
			const shareUrl = `${location.origin}/review?shareId=${encodeURIComponent(data.id)}`;
			return shareUrl;
		},
	});

	const onCopyShareLink = useCallback(async () => {
		if (!model) return;
		toast.promise(
			shareMutation.mutateAsync().then(async (shareUrl) => {
				await navigator.clipboard.writeText(shareUrl);
				return shareUrl;
			}),
			{
				loading: "Creating share link…",
				success: "Share link copied to clipboard",
				error: (e) =>
					e instanceof Error ? e.message : "Failed to create share link",
			},
		);
	}, [model, shareMutation]);

	return { onCopyShareLink, isSharing: shareMutation.isPending } as const;
}
