"use client";

import { Edit3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Props = {
	importing: boolean;
	error: string | null;
	onPick: (file: File) => Promise<void> | void;
};

export function ImportDialog({ importing, error, onPick }: Props) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-full gap-2">
					<Edit3 className="h-4 w-4" /> Import .transedit
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Open .transedit</DialogTitle>
					<DialogDescription>
						Choose a .transedit file to open the review dashboard. Your edits
						will auto-save locally.
					</DialogDescription>
				</DialogHeader>

				<Input
					type="file"
					accept=".transedit,application/json"
					onChange={async (e) => {
						const f = e.target.files?.[0] ?? null;
						if (!f) return;
						await onPick(f);
						e.currentTarget.value = "";
					}}
				/>

				{error && (
					<div className="mt-3 rounded-md border bg-destructive/10 border-destructive/30 p-3 text-sm text-destructive">
						{error}
					</div>
				)}

				{importing && (
					<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span>Parsing file…</span>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
