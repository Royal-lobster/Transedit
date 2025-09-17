"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { type TransEditFile, toTransEditJson } from "@/lib/helpers/transedit";

export function useCreateShareLink() {
	const mutation = useMutation({
		mutationFn: async (model: TransEditFile) => {
			const res = await fetch("/api/share", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: toTransEditJson(model),
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

	const createShareLink = mutation.mutateAsync;

	const createShareLinkWithToast = async (
		model: TransEditFile,
		opts: { autoCopy?: boolean } = {},
	) =>
		toast.promise(
			createShareLink(model).then(async (url) => {
				if (opts.autoCopy) await navigator.clipboard.writeText(url);
				return url;
			}),
			{
				loading: "Creating share link…",
				success: opts.autoCopy
					? "Share link copied to clipboard"
					: "Share link created",
				error: (e) =>
					e instanceof Error ? e.message : "Failed to create share link",
			},
		);

	return {
		createShareLink,
		createShareLinkWithToast,
		isPending: mutation.isPending,
	} as const;
}
