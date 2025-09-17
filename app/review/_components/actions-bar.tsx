"use client";

import { Button } from "@/components/ui/button";

type ActionsBarProps = {
	targetLang: string | null;
	onDownloadLocale: () => void;
};

export function ActionsBar({ targetLang, onDownloadLocale }: ActionsBarProps) {
	return (
		<div className="flex items-center gap-2 flex-shrink-0">
			<Button
				onClick={onDownloadLocale}
				disabled={!targetLang}
				className="text-sm px-3"
			>
				Export {targetLang || "locale"}
			</Button>
		</div>
	);
}
