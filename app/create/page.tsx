"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, FileDown, Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
	buildShareUrl,
	downloadFile,
	generateTransEditFile,
	readJsonFromFile,
	safeJsonParse,
	toTransEditJson,
} from "@/lib/transedit";

type JsonObject = Record<string, unknown>;

// Validate only text fields with zod, handle Files manually.
const schema = z.object({
	sourceLang: z.string().min(1, "Source language is required"),
	targetLang: z.string().min(1, "Target language is required"),
});

type FormValues = {
	sourceLang: string;
	targetLang: string;
	enFile: File | null;
	localeFile: File | null;
};

export default function CreateReviewRequestPage() {
	const form = useForm<FormValues>({
		// Cast resolver to satisfy RHF generic with extra fields (files) outside zod schema
		resolver: zodResolver(schema) as any,
		defaultValues: {
			sourceLang: "en",
			targetLang: "",
			enFile: null,
			localeFile: null,
		},
		mode: "onChange",
	});

	const [info, setInfo] = useState<string | null>(null);
	const [parseErrors, setParseErrors] = useState<string[]>([]);
	const [previewCounts, setPreviewCounts] = useState<{
		en: number;
		target: number;
	} | null>(null);
	const [shareUrl, setShareUrl] = useState<string | null>(null);

	const inferLangFromFilename = (file: File | null) => {
		if (!file) return "";
		const base = file.name.toLowerCase();
		const m = base.match(/^([a-z]{2,3}([-_][a-z]{2,3})?)\.json$/i);
		return m ? m[1] : "";
	};

	const validateJsonFiles = useCallback(
		async (enFile: File | null, localeFile: File | null) => {
			const errs: string[] = [];
			if (!enFile) errs.push("Upload en.json (source language file).");
			if (enFile) {
				const text = await enFile.text();
				try {
					safeJsonParse(text);
				} catch (e: any) {
					errs.push(`en.json is not valid JSON: ${e?.message ?? String(e)}`);
				}
			}
			if (localeFile) {
				const text = await localeFile.text();
				try {
					safeJsonParse(text);
				} catch (e: any) {
					errs.push(
						`Target locale file is not valid JSON: ${e?.message ?? String(e)}`,
					);
				}
			}
			setParseErrors(errs);
			return errs.length === 0;
		},
		[],
	);

	const onSubmit = async (values: FormValues) => {
		setInfo(null);
		setPreviewCounts(null);
		setParseErrors([]);
		setShareUrl(null);

		const { sourceLang, targetLang } = values;
		const enFile = values.enFile;
		const localeFile = values.localeFile;

		if (!enFile) {
			setParseErrors(["Upload en.json (source language file)."]);
			return;
		}
		if (!targetLang || targetLang.trim() === "") {
			setParseErrors(["Enter a target language code (e.g., ko, zh-CN)."]);
			return;
		}

		const ok = await validateJsonFiles(enFile, localeFile);
		if (!ok) return;

		const enObj = await readJsonFromFile<JsonObject>(enFile);
		const targetObj = localeFile
			? await readJsonFromFile<JsonObject>(localeFile)
			: null;

		const model = generateTransEditFile({
			enObject: enObj,
			targetObject: targetObj,
			sourceLang,
			targetLang,
		});

		const json = toTransEditJson(model);
		const fileName = `${model.meta.sourceLang}-${model.meta.targetLang}.transedit`;
		downloadFile(fileName, json, "application/json");
		setShareUrl(buildShareUrl(model));

		setPreviewCounts({
			en: Object.keys(model.en).length,
			target: Object.keys(model.target).length,
		});
		setInfo(`.transedit generated with ${Object.keys(model.en).length} keys.`);
	};

	const disabled = useMemo(() => {
		const vs = form.getValues();
		return !vs.enFile || !vs.targetLang;
	}, [form]);

	return (
		<div className="min-h-screen w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
			<div className="mx-auto max-w-3xl px-6 py-10">
				<div className="mb-8 flex items-center gap-3">
					<Sparkles className="h-6 w-6 text-fuchsia-400" />
					<h1 className="text-2xl font-semibold tracking-tight">
						Create Review Request
					</h1>
				</div>

				<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur">
					<p className="mb-6 text-sm text-zinc-300">
						Upload your English source file (en.json) and optionally an existing
						target language file (e.g., ko.json). Enter the target language code
						and generate a sharable .transedit file.
					</p>

					<Form {...form}>
						<form
							className="grid gap-6"
							onSubmit={form.handleSubmit(onSubmit as any)}
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
										{parseErrors.map((e) => (
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
											Keys: EN {previewCounts.en} • Target{" "}
											{previewCounts.target}
										</p>
									)}
								</div>
							)}

							{shareUrl && (
								<div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-300">
									<div className="mb-2 font-medium text-zinc-100">
										Share link
									</div>
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
											<a
												href={shareUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
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

								<Button
									type="button"
									variant="outline"
									asChild
									className="gap-2"
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
			</div>
		</div>
	);
}
