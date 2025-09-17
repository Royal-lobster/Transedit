"use client";

import { Copy, FileDown, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
		<Card>
			<CardContent className="p-6">
				<p className="mb-6 text-sm text-muted-foreground">
					Upload your English source file (en.json) and optionally an existing
					target language file (e.g., ko.json). Enter the target language code
					and generate a sharable .transedit file.
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
												className="file:text-sm"
											/>
										</FormControl>
										{form.getValues().enFile && (
											<FormDescription className="text-xs">
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
												className="file:text-sm"
											/>
										</FormControl>
										{form.getValues().localeFile && (
											<FormDescription className="text-xs">
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
										<FormDescription className="text-xs">
											If empty, we try to infer from filename (e.g., ko.json).
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

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
			</CardContent>
		</Card>
	);
}
