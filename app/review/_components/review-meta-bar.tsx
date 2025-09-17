"use client";

import { Progress } from "@/components/ui/progress";

export function ReviewMetaBar({
	sourceLang,
	targetLang,
	projectId,
	percent,
	translated,
	total,
}: {
	sourceLang: string;
	targetLang: string;
	projectId: string;
	percent: number;
	translated: number;
	total: number;
}) {
	return (
		<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-sm text-zinc-400">
						Source:{" "}
						<span className="text-zinc-200 font-medium">{sourceLang}</span> •
						Target:{" "}
						<span className="text-zinc-200 font-medium">{targetLang}</span>
					</p>
					<p className="text-xs text-zinc-500">
						Project ID: <span className="text-zinc-400">{projectId}</span>
					</p>
				</div>
				<div className="min-w-[220px]">
					<Progress value={percent} />
					<p className="mt-1 text-right text-xs text-zinc-400">
						{translated}/{total} • {percent}%
					</p>
				</div>
			</div>
		</div>
	);
}
