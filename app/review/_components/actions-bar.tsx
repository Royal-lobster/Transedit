"use client";

import { MoreVertical } from "lucide-react";
import ShareDisclaimer from "@/components/shared/share-disclaimer";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type ActionsBarProps = {
	targetLang: string | null;
	onDownloadLocale: () => void;
	onDownloadTransedit: () => void;
	onCopyShareLink: () => void;
	isSharing?: boolean;
};

export function ActionsBar({
	targetLang,
	onDownloadLocale,
	onDownloadTransedit,
	onCopyShareLink,
	isSharing,
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
					<Button variant="outline" size="icon" aria-label="More actions">
						<MoreVertical className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={onDownloadTransedit}>
						Download .transedit
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<ShareDisclaimer side="right">
						<DropdownMenuItem onClick={onCopyShareLink} disabled={isSharing}>
							{isSharing ? "Creating share link…" : "Copy share link"}
						</DropdownMenuItem>
					</ShareDisclaimer>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
