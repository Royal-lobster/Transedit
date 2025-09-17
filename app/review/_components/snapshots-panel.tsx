"use client";

import { History, Save } from "lucide-react";
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

type Snapshot = { id: string; at: string; note?: string | null };

export function SnapshotsPanel({
	control,
	snapshots,
	onSaveSnapshot,
}: {
	control: Control<ReviewFormValues>;
	snapshots: Snapshot[];
	onSaveSnapshot: () => void;
}) {
	return (
		<div className="p-4">
			<div className="mb-3 flex items-center gap-2">
				<History className="h-4 w-4 text-muted-foreground" />
				<h3 className="text-sm font-medium">Snapshots</h3>
			</div>
			<FormField
				control={control}
				name="note"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Note</FormLabel>
						<FormControl>
							<Input placeholder="Optional note for snapshot..." {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<Button
				type="button"
				className="mt-3 w-full gap-2"
				onClick={onSaveSnapshot}
			>
				<Save className="h-4 w-4" />
				Save snapshot
			</Button>
			<div className="mt-4 max-h-[320px] overflow-auto">
				{snapshots.length === 0 ? (
					<p className="text-xs text-muted-foreground">No snapshots yet.</p>
				) : (
					<ul className="space-y-2">
						{snapshots.map((s) => (
							<li key={s.id} className="rounded-md border p-2">
								<p className="text-xs text-muted-foreground">
									{new Date(s.at).toLocaleString()}{" "}
									{s.note ? `• ${s.note}` : ""}
								</p>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
