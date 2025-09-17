"use client";

import { Copy, FileDown, Upload } from "lucide-react";
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
import { useCreateReview } from "../_hooks/use-create-review";

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

	return (
		<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur">
			<p className="mb-6 text-sm text-zinc-300">
				Upload your English source file (en.json) and optionally an existing
				target language file (e.g., ko.json). Enter the target language code and
				generate a sharable .transedit file.
			</p>

			<Form {...form}>
				<form
					className="grid gap-6"
					onSubmit={form.handleSubmit(onSubmit)}
					noValidate
				>
					<div className="grid gap-6 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="enFile"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Source (en.json)</FormLabel>
									<FormControl>
										<Input
											type="file"
											accept="application/json,.json"
											name={field.name}
											ref={field.ref}
											onBlur={field.onBlur}
											onChange={(e) => {
												const f = e.target.files?.[0] ?? null;
												field.onChange(f);
											}}
										/>
									</FormControl>
									{form.getValues().enFile && (
										<FormDescription>
											{form.getValues().enFile?.name}
										</FormDescription>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="localeFile"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Optional target (e.g., ko.json)</FormLabel>
									<FormControl>
										<Input
											type="file"
											accept="application/json,.json"
											name={field.name}
											ref={field.ref}
											onBlur={field.onBlur}
											onChange={(e) => {
												const f = e.target.files?.[0] ?? null;
												field.onChange(f);
												if (f && !form.getValues().targetLang) {
													const inferred = inferLangFromFilename(f);
													if (inferred)
														form.setValue("targetLang", inferred, {
															shouldDirty: true,
															shouldValidate: true,
														});
												}
											}}
										/>
									</FormControl>
									{form.getValues().localeFile && (
										<FormDescription>
											{form.getValues().localeFile?.name}
										</FormDescription>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-3">
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
								<FormItem className="sm:col-span-2">
									<FormLabel>Target language</FormLabel>
									<FormControl>
										<Input placeholder="ko or zh-CN" {...field} />
									</FormControl>
									<FormDescription>
										If empty, we try to infer from filename (e.g., ko.json).
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{parseErrors.length > 0 && (
						<div className="rounded-lg border border-red-900/40 bg-red-950/40 p-4 text-sm text-red-300">
							<ul className="list-inside list-disc space-y-1">
								{parseErrors.map((e: string) => (
									<li key={e}>{e}</li>
								))}
							</ul>
						</div>
					)}

					{info && (
						<div className="rounded-lg border border-emerald-900/40 bg-emerald-950/40 p-4 text-sm text-emerald-300">
							<p>{info}</p>
							{previewCounts && (
								<p className="mt-1 text-emerald-400/80">
									Keys: EN {previewCounts.en} • Target {previewCounts.target}
								</p>
							)}
						</div>
					)}

					{shareUrl && (
						<div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-300">
							<div className="mb-2 font-medium text-zinc-100">Share link</div>
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
								<Input readOnly value={shareUrl} className="flex-1" />
								<Button
									type="button"
									variant="secondary"
									className="gap-2"
									onClick={() =>
										shareUrl && navigator.clipboard.writeText(shareUrl)
									}
								>
									<Copy className="h-4 w-4" />
									Copy
								</Button>
								<Button asChild variant="outline" className="gap-2">
									<a href={shareUrl} target="_blank" rel="noopener noreferrer">
										Open Review
									</a>
								</Button>
							</div>
							<p className="mt-2 text-xs text-zinc-500">
								Anyone with this link can open the review dashboard in their
								browser and start editing immediately.
							</p>
						</div>
					)}
					<div className="flex gap-3">
						<Button type="submit" disabled={disabled} className="gap-2">
							<FileDown className="h-4 w-4" />
							Generate .transedit
						</Button>

						<Button type="button" variant="outline" asChild className="gap-2">
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
