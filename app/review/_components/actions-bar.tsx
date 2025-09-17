"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ActionsBarProps = {
	targetLang: string | null;
	onDownloadLocale: () => void;
	onTransFileChange: (file: File) => Promise<void>;
};

export function ActionsBar({
	targetLang,
	onDownloadLocale,
	onTransFileChange,
}: ActionsBarProps) {
	return (
		<div className="flex items-center gap-2 flex-shrink-0">
			<Button
				onClick={onDownloadLocale}
				disabled={!targetLang}
				className="text-sm px-3"
			>
				Export {targetLang || "locale"}
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						aria-label="More"
						className="flex-shrink-0"
					>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem asChild>
						<label className="w-full cursor-pointer">
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
							Replace .transedit
						</label>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
