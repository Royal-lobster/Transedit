"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Props {
	shareUrl: string;
}

export function ShareLinkPanel({ shareUrl }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-sm font-medium text-zinc-100">
					Share link
				</CardTitle>
				<CardDescription>
					Anyone with this link can open the review dashboard in their browser
					and start editing immediately.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Input readOnly value={shareUrl} className="flex-1 text-xs" />
					<div className="flex gap-2 sm:flex-shrink-0">
						<Button
							type="button"
							variant="secondary"
							className="gap-2 flex-1 sm:flex-none"
							onClick={() => navigator.clipboard.writeText(shareUrl)}
						>
							<Copy className="h-4 w-4" />
							Copy
						</Button>
						<Button
							asChild
							variant="outline"
							className="gap-2 flex-1 sm:flex-none"
						>
							<a href={shareUrl} target="_blank" rel="noopener noreferrer">
								Open Review
							</a>
						</Button>
					</div>
				</div>
				<p className="text-xs text-muted-foreground mt-2">
					By creating a share link you consent to upload the .transedit file to
					catbox.moe for temporary hosting (anyone with the link can access it).
				</p>
			</CardContent>
		</Card>
	);
}
