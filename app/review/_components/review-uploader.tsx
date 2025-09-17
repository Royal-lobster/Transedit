"use client";

import { Undo2 } from "lucide-react";
import Link from "next/link";
import type { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ReviewFormValues } from "../_hooks/use-review";

export function ReviewUploader({
	control,
	error,
	onPick,
}: {
	control: Control<ReviewFormValues>;
	error?: string | null;
	onPick: (file: File) => void;
}) {
	return (
		<div className="rounded-xl border p-6">
			<p className="mb-4 text-sm text-muted-foreground">
				Upload a .transedit file to open the review dashboard. Your edits
				auto-save to your browser.
			</p>
			<div className="grid gap-2">
				<FormField
					control={control}
					name="transFile"
					render={({ field }) => (
						<FormItem>
							<FormLabel>.transedit file</FormLabel>
							<FormControl>
								<Input
									type="file"
									accept=".transedit,application/json"
									onChange={(e) => {
										const f = e.target.files?.[0] ?? null;
										field.onChange(f);
										if (f) onPick(f);
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
			{error && (
				<div className="mt-4 rounded-md border bg-destructive/10 border-destructive/30 p-3 text-sm text-destructive">
					{error}
				</div>
			)}
			<div className="mt-6">
				<Button asChild variant="outline" className="gap-2">
					<Link href="/">
						<Undo2 className="h-4 w-4" />
						Back to Home
					</Link>
				</Button>
			</div>
		</div>
	);
}
