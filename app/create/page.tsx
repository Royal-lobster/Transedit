"use client";

import { FileDown, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ShareLinkPanel } from "./_components/share-link-panel";
// file input is now used within extracted subcomponents
import { SourceInput } from "./_components/source-input";
import { TargetInput } from "./_components/target-input";
// removed inline textarea/toggle usage after extraction
import { useCreateReview } from "./_hooks/use-create-review";

function CreatePage() {
	const {
		form,
		info,
		parseErrors,
		previewCounts,
		shareUrl,
		isSharing,
		onCreateShareLink,
		inferLangFromFilename,
		onSubmit,
		disabled,
	} = useCreateReview();

	// modes are handled inside subcomponents

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
						<SourceInput form={form} />

						{/* Target section */}
						<TargetInput
							form={form}
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

					{shareUrl && <ShareLinkPanel shareUrl={shareUrl} />}

					<div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
						<div className="flex gap-2 w-full sm:w-auto">
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
								variant="secondary"
								disabled={disabled || isSharing}
								onClick={onCreateShareLink}
								className="gap-2 w-full sm:w-auto"
							>
								{isSharing ? (
									<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" />
								) : (
									<Upload className="h-4 w-4" />
								)}
								Create Share Link
							</Button>
						</div>

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

export default CreatePage;
