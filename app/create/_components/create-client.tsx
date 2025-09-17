"use client";

import {
	ClipboardPaste,
	Copy,
	FileDown,
	File as FileIcon,
	Upload,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCreateReview } from "../_hooks/use-create-review";
import { FileInput } from "./file-input";

export function CreateClient() {
	const {
		form,
		info,
		parseErrors,
		previewCounts,
		shareUrl,
		inferLangFromFilename,
		onSubmit,
		disabled,
	} = useCreateReview();

	const sourceMode = form.watch("sourceMode");
	const targetMode = form.watch("targetMode");

	return (
		<div className="p-6 max-w-2xl mx-auto">
			<p className="mb-6 text-sm text-muted-foreground">
				Upload your English source (en.json) or paste JSON directly. Optionally
				add a target JSON (e.g., ko.json). Enter the target language code and a
				title to generate a sharable .transedit file.
			</p>

			<Form {...form}>
				<form
					className="grid gap-6"
					onSubmit={form.handleSubmit(onSubmit)}
					noValidate
				>
					{/* Title */}
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input
										placeholder="e.g., Marketing Site – Korean"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Source & Target in single column */}
					<div className="grid gap-6">
						{/* Source section */}
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

						{/* Target section */}
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
														onLanguageInfer={(file) => {
															if (!form.getValues().targetLang) {
																const inferred = inferLangFromFilename(file);
																if (inferred)
																	form.setValue("targetLang", inferred, {
																		shouldDirty: true,
																		shouldValidate: true,
																	});
															}
														}}
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
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="sourceLang"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Source language</FormLabel>
									<FormControl>
										<Input placeholder="en" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="targetLang"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Target language</FormLabel>
									<FormControl>
										<Input placeholder="ko or zh-CN" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<p className="text-xs text-muted-foreground">
						Tip: If target language is empty, we try to infer it from the target
						filename (e.g., ko.json).
					</p>

					{parseErrors.length > 0 && (
						<div className="rounded-lg border bg-destructive/10 border-destructive/30 p-4 text-sm text-destructive">
							<ul className="list-inside list-disc space-y-1">
								{parseErrors.map((e: string) => (
									<li key={e}>{e}</li>
								))}
							</ul>
						</div>
					)}

					{info && (
						<div className="rounded-lg border bg-primary/10 border-primary/20 p-4 text-sm text-primary">
							<p>{info}</p>
							{previewCounts && (
								<p className="mt-1 text-primary/80">
									Keys: EN {previewCounts.en} • Target {previewCounts.target}
								</p>
							)}
						</div>
					)}

					{shareUrl && (
						<div className="rounded-lg border p-4 text-sm space-y-3">
							<div className="font-medium text-zinc-100">Share link</div>
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
								<Input readOnly value={shareUrl} className="flex-1 text-xs" />
								<div className="flex gap-2 sm:flex-shrink-0">
									<Button
										type="button"
										variant="secondary"
										className="gap-2 flex-1 sm:flex-none"
										onClick={() =>
											shareUrl && navigator.clipboard.writeText(shareUrl)
										}
									>
										<Copy className="h-4 w-4" />
										Copy
									</Button>
									<Button
										asChild
										variant="outline"
										className="gap-2 flex-1 sm:flex-none"
									>
										<a
											href={shareUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											Open Review
										</a>
									</Button>
								</div>
							</div>
							<p className="text-xs text-muted-foreground">
								Anyone with this link can open the review dashboard in their
								browser and start editing immediately.
							</p>
						</div>
					)}

					<div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
						<Button
							type="submit"
							disabled={disabled}
							className="gap-2 w-full sm:w-auto"
						>
							<FileDown className="h-4 w-4" />
							Generate .transedit
						</Button>

						<Button
							type="button"
							variant="outline"
							asChild
							className="gap-2 w-full sm:w-auto"
						>
							<Link href="/">
								<Upload className="h-4 w-4" />
								Back to Home
							</Link>
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
