"use client";

import { Button } from "@/components/ui/button";

type ActionsBarProps = {
	targetLang: string | null;
	onSaveSnapshot: () => void;
	onDownloadLocale: () => void;
	onTransFileChange: (file: File) => Promise<void>;
};

export function ActionsBar({
	targetLang,
	onSaveSnapshot,
	onDownloadLocale,
	onTransFileChange,
}: ActionsBarProps) {
	return (
		<div className="flex items-center gap-2">
			<Button variant="secondary" onClick={onSaveSnapshot}>
				Save snapshot
			</Button>
			<Button onClick={onDownloadLocale} disabled={!targetLang}>
				Export {targetLang || "locale"}
			</Button>
			<label className="cursor-pointer">
				<span className="sr-only">Replace .transedit file</span>
				<input
					type="file"
					accept=".transedit,application/json"
					className="hidden"
					onChange={async (e) => {
						const file = e.target.files?.[0];
						if (file) await onTransFileChange(file);
						e.currentTarget.value = "";
					}}
				/>
				<Button variant="outline">Replace .transedit</Button>
			</label>
		</div>
	);
}
