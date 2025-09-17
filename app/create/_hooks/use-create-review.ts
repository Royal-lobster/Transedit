"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import {
	buildShareUrl,
	downloadFile,
	generateTransEditFile,
	readJsonFromFile,
	safeJsonParse,
	toTransEditJson,
} from "@/lib/transedit";

type JsonObject = Record<string, unknown>;

export const createSchema = z
	.object({
		title: z.string().trim().min(1, "Title is required"),
		sourceLang: z.string().trim().min(1, "Source language is required"),
		targetLang: z.string().trim().min(1, "Target language is required"),
		// Keep file inputs in the parsed result without strict validation
		enFile: z.any().nullable().optional(),
		localeFile: z.any().nullable().optional(),
		// Allow direct paste as an alternative to file upload
		enText: z.string().optional().default(""),
		localeText: z.string().optional().default(""),
		sourceMode: z.enum(["file", "paste"]).default("file"),
		targetMode: z.enum(["file", "paste"]).default("file"),
	})
	.passthrough();

export type CreateFormValues = {
	title: string;
	sourceLang: string;
	targetLang: string;
	enFile: File | null;
	localeFile: File | null;
	enText: string;
	localeText: string;
	sourceMode: "file" | "paste";
	targetMode: "file" | "paste";
};

export function useCreateReview() {
	const resolver = zodResolver(
		createSchema,
	) as unknown as Resolver<CreateFormValues>;

	const form = useForm<CreateFormValues>({
		resolver,
		defaultValues: {
			title: "",
			sourceLang: "en",
			targetLang: "",
			enFile: null,
			localeFile: null,
			enText: "",
			localeText: "",
			sourceMode: "file",
			targetMode: "file",
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

	const validateJsonInputs = useCallback(
		async (
			en: { mode: "file" | "paste"; file: File | null; text: string },
			locale: { mode: "file" | "paste"; file: File | null; text: string },
		) => {
			const errs: string[] = [];
			// Validate source
			if (en.mode === "file") {
				if (!en.file) errs.push("Upload en.json (source language file).");
				if (en.file) {
					const text = await en.file.text();
					try {
						safeJsonParse(text);
					} catch (e: unknown) {
						const msg = e instanceof Error ? e.message : String(e);
						errs.push(`en.json is not valid JSON: ${msg}`);
					}
				}
			} else {
				if (!en.text || en.text.trim() === "")
					errs.push("Paste source JSON (en).");
				else {
					try {
						safeJsonParse(en.text);
					} catch (e: unknown) {
						const msg = e instanceof Error ? e.message : String(e);
						errs.push(`Source JSON is not valid: ${msg}`);
					}
				}
			}

			// Validate optional target
			if (locale.mode === "file") {
				if (locale.file) {
					const text = await locale.file.text();
					try {
						safeJsonParse(text);
					} catch (e: unknown) {
						const msg = e instanceof Error ? e.message : String(e);
						errs.push(`Target locale file is not valid JSON: ${msg}`);
					}
				}
			} else {
				if (locale.text && locale.text.trim() !== "") {
					try {
						safeJsonParse(locale.text);
					} catch (e: unknown) {
						const msg = e instanceof Error ? e.message : String(e);
						errs.push(`Target JSON is not valid: ${msg}`);
					}
				}
			}
			setParseErrors(errs);
			return errs.length === 0;
		},
		[],
	);

	const onSubmit = async (values: CreateFormValues) => {
		setInfo(null);
		setPreviewCounts(null);
		setParseErrors([]);
		setShareUrl(null);

	const { sourceLang, targetLang, title } = values;
		const { sourceMode, targetMode } = values;
		const enFile = values.enFile;
		const localeFile = values.localeFile;
		const enText = values.enText;
		const localeText = values.localeText;

		// Require targetLang always
		if (!targetLang || targetLang.trim() === "") {
			setParseErrors(["Enter a target language code (e.g., ko, zh-CN)."]);
			return;
		}

		const ok = await validateJsonInputs(
			{ mode: sourceMode, file: enFile, text: enText },
			{ mode: targetMode, file: localeFile, text: localeText },
		);
		if (!ok) return;

		// Parse source object
		const enObj: JsonObject =
			sourceMode === "file"
				? await readJsonFromFile<JsonObject>(enFile as File)
				: safeJsonParse<JsonObject>(enText);

		// Parse optional target object
		const targetObj: JsonObject | null =
			targetMode === "file"
				? localeFile
					? await readJsonFromFile<JsonObject>(localeFile)
					: null
				: localeText.trim() === ""
					? null
					: safeJsonParse<JsonObject>(localeText);

		const model = generateTransEditFile({
			enObject: enObj,
			targetObject: targetObj,
			sourceLang,
			targetLang,
			title,
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

	// Disabled state must react to form updates; use watch so it re-renders
	const watchedTitle = form.watch("title");
	const watchedSourceMode = form.watch("sourceMode");
	const watchedEnFile = form.watch("enFile");
	const watchedEnText = form.watch("enText");
	const watchedTargetLang = form.watch("targetLang");
	const disabled = useMemo(() => {
		const hasSource =
			watchedSourceMode === "file"
				? !!watchedEnFile
				: Boolean(watchedEnText && watchedEnText.trim() !== "");
		const hasTitle = Boolean(watchedTitle && watchedTitle.trim() !== "");
		return (
			!hasSource ||
			!hasTitle ||
			!watchedTargetLang ||
			watchedTargetLang.trim() === ""
		);
	}, [
		watchedSourceMode,
		watchedEnFile,
		watchedEnText,
		watchedTargetLang,
		watchedTitle,
	]);

	return {
		form,
		info,
		parseErrors,
		previewCounts,
		shareUrl,
		inferLangFromFilename,
		onSubmit,
		disabled,
	};
}
