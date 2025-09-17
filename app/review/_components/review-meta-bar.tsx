"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ReviewMetaBar({
	sourceLang,
	targetLang,
	title,
	projectId,
	percent,
	translated,
	total,
}: {
	sourceLang: string;
	targetLang: string;
	title?: string;
	projectId: string;
	percent: number;
	translated: number;
	total: number;
}) {
	const displayTitle =
		title && title.trim() !== "" ? title : `${sourceLang} → ${targetLang}`;
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex flex-col gap-3">
					<div>
						<p className="text-sm font-medium truncate" title={displayTitle}>
							{displayTitle}
						</p>
						<p className="text-sm text-muted-foreground">
							Source:{" "}
							<span className="text-foreground font-medium">{sourceLang}</span>{" "}
							• Target:{" "}
							<span className="text-foreground font-medium">{targetLang}</span>
						</p>
						<p className="text-xs text-muted-foreground">
							Project ID:{" "}
							<span className="text-muted-foreground/80 break-all">
								{projectId}
							</span>
						</p>
					</div>
					<div className="w-full">
						<Progress value={percent} />
						<p className="mt-1 text-right text-xs text-muted-foreground">
							{translated}/{total} • {percent}%
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
