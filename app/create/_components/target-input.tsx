"use client";

import { ClipboardPaste, File as FileIcon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { CreateFormValues } from "../_hooks/use-create-review";
import { FileInput } from "./file-input";

type Props = {
	form: UseFormReturn<CreateFormValues>;
	onLanguageInfer: (file: File | null) => void;
};

export function TargetInput({ form, onLanguageInfer }: Props) {
	const targetMode = form.watch("targetMode");

	return (
		<div className="grid gap-3">
			<div className="flex justify-between items-center gap-2 flex-wrap">
				<div className="text-sm font-medium">Optional target</div>
				<FormField
					control={form.control}
					name="targetMode"
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
				{targetMode === "file" ? (
					<FormField
						control={form.control}
						name="localeFile"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Upload target (e.g., ko.json)</FormLabel>
								<FormControl>
									<FileInput
										value={field.value}
										onChange={field.onChange}
										accept="application/json,.json"
										placeholder="JSON files only (up to 10MB)"
										onLanguageInfer={onLanguageInfer}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : (
					<FormField
						control={form.control}
						name="localeText"
						render={({ field }) => (
							<FormItem className="sm:col-span-2">
								<FormLabel>Paste target JSON (optional)</FormLabel>
								<FormControl>
									<Textarea
										placeholder={'{\n  "greeting": "안녕하세요"\n}'}
										rows={6}
										className="font-mono text-sm"
										{...field}
									/>
								</FormControl>
								<FormDescription className="text-xs">
									Leave empty to start from scratch.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
			</div>
		</div>
	);
}
