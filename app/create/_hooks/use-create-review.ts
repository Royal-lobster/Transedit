"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateShareLink } from "@/app/create/_hooks/use-create-share-link";
import {
	computeDisabled,
	inferLangFromFilename as inferLangFromFilenameHelper,
	readJsonObjectFromInput,
	readOptionalJsonObjectFromInput,
	validateJsonInputs as validateJsonInputsHelper,
} from "@/lib/helpers/create";
import {
	downloadFile,
	generateTransEditFile,
	toTransEditJson,
} from "@/lib/helpers/transedit";

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
	const { createShareLink, isPending: isSharing } = useCreateShareLink();

	const inferLangFromFilename = (file: File | null) =>
		inferLangFromFilenameHelper(file);

	const validateJsonInputs = useCallback(
		async (
			en: { mode: "file" | "paste"; file: File | null; text: string },
			locale: { mode: "file" | "paste"; file: File | null; text: string },
		) => {
			const errs = await validateJsonInputsHelper(en, locale);
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
		const enObj: JsonObject = await readJsonObjectFromInput(
			sourceMode,
			enFile,
			enText,
		);

		// Parse optional target object
		const targetObj: JsonObject | null = await readOptionalJsonObjectFromInput(
			targetMode,
			localeFile,
			localeText,
		);

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
		// No auto share link here; user can click "Create Share Link" to upload
		setShareUrl(null);

		setPreviewCounts({
			en: Object.keys(model.en).length,
			target: Object.keys(model.target).length,
		});
		setInfo(`.transedit generated with ${Object.keys(model.en).length} keys.`);
	};

	const onCreateShareLink = async () => {
		setParseErrors([]);
		setInfo(null);
		setShareUrl(null);
		const values = form.getValues();
		const { sourceLang, targetLang, title, sourceMode, targetMode } = values;
		const enFile = values.enFile;
		const localeFile = values.localeFile;
		const enText = values.enText;
		const localeText = values.localeText;

		if (!targetLang || targetLang.trim() === "") {
			setParseErrors(["Enter a target language code (e.g., ko, zh-CN)."]);
			return;
		}

		const ok = await validateJsonInputs(
			{ mode: sourceMode, file: enFile, text: enText },
			{ mode: targetMode, file: localeFile, text: localeText },
		);
		if (!ok) return;

		// Build model (same as onSubmit, but no download)
		const enObj: JsonObject = await readJsonObjectFromInput(
			sourceMode,
			enFile,
			enText,
		);

		const targetObj: JsonObject | null = await readOptionalJsonObjectFromInput(
			targetMode,
			localeFile,
			localeText,
		);

		const model = generateTransEditFile({
			enObject: enObj,
			targetObject: targetObj,
			sourceLang,
			targetLang,
			title,
		});

		try {
			const url = await createShareLink(model);
			setShareUrl(url);
			setInfo("Share link created successfully.");
			setPreviewCounts({
				en: Object.keys(model.en).length,
				target: Object.keys(model.target).length,
			});
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			setParseErrors([msg]);
		}
	};

	// Disabled state must react to form updates; use watch so it re-renders
	const watchedValues = form.watch();
	const disabled = useMemo(
		() => computeDisabled(watchedValues),
		[watchedValues],
	);

	return {
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
	};
}
