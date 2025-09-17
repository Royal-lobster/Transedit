"use client";

import { ClipboardPaste, File as FileIcon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { CreateFormValues } from "../_hooks/use-create-review";
import { FileInput } from "./file-input";

type Props = {
	form: UseFormReturn<CreateFormValues>;
};

export function SourceInput({ form }: Props) {
	const sourceMode = form.watch("sourceMode");

	return (
		<div className="grid gap-3">
			<div className="flex justify-between items-center gap-2 flex-wrap">
				<div className="text-sm font-medium">Source (en)</div>
				<FormField
					control={form.control}
					name="sourceMode"
					render={({ field }) => (
						<ToggleGroup
							type="single"
							value={field.value}
							onValueChange={(v) => v && field.onChange(v)}
							variant="outline"
							size="sm"
						>
							<ToggleGroupItem
								value="file"
								className="min-w-20"
								aria-label="File"
							>
								<FileIcon className="size-4" /> File
							</ToggleGroupItem>
							<ToggleGroupItem
								value="paste"
								className="min-w-20"
								aria-label="Paste"
							>
								<ClipboardPaste className="size-4" /> Paste
							</ToggleGroupItem>
						</ToggleGroup>
					)}
				/>
			</div>

			<div className="grid gap-6">
				{sourceMode === "file" ? (
					<FormField
						control={form.control}
						name="enFile"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Upload en.json</FormLabel>
								<FormControl>
									<FileInput
										value={field.value}
										onChange={field.onChange}
										accept="application/json,.json"
										placeholder="JSON files only (up to 10MB)"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : (
					<FormField
						control={form.control}
						name="enText"
						render={({ field }) => (
							<FormItem className="sm:col-span-2">
								<FormLabel>Paste source JSON</FormLabel>
								<FormControl>
									<Textarea
										placeholder={'{\n  "greeting": "Hello"\n}'}
										rows={6}
										className="font-mono text-sm"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
			</div>
		</div>
	);
}
