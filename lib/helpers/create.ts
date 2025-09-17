import { readJsonFromFile, safeJsonParse } from "@/lib/helpers/transedit";

export type JsonObject = Record<string, unknown>;

export function inferLangFromFilename(file: File | null) {
	if (!file) return "";
	const base = file.name.toLowerCase();
	const m = base.match(/^([a-z]{2,3}([-_][a-z]{2,3})?)\.json$/i);
	return m ? m[1] : "";
}

export async function validateJsonInputs(
	en: { mode: "file" | "paste"; file: File | null; text: string },
	locale: { mode: "file" | "paste"; file: File | null; text: string },
): Promise<string[]> {
	const errs: string[] = [];
	// Source
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
		if (!en.text || en.text.trim() === "") errs.push("Paste source JSON (en).");
		else {
			try {
				safeJsonParse(en.text);
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : String(e);
				errs.push(`Source JSON is not valid: ${msg}`);
			}
		}
	}

	// Optional target
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
	return errs;
}

export async function readJsonObjectFromInput(
	mode: "file" | "paste",
	file: File | null,
	text: string,
): Promise<JsonObject> {
	return mode === "file"
		? await readJsonFromFile<JsonObject>(file as File)
		: safeJsonParse<JsonObject>(text);
}

export async function readOptionalJsonObjectFromInput(
	mode: "file" | "paste",
	file: File | null,
	text: string,
): Promise<JsonObject | null> {
	if (mode === "file") {
		return file ? await readJsonFromFile<JsonObject>(file) : null;
	}
	if (!text || text.trim() === "") return null;
	return safeJsonParse<JsonObject>(text);
}

export function computeDisabled(values: {
	sourceMode: "file" | "paste";
	enFile: File | null;
	enText: string;
	title: string;
	targetLang: string;
}) {
	const hasSource =
		values.sourceMode === "file"
			? !!values.enFile
			: Boolean(values.enText && values.enText.trim() !== "");
	const hasTitle = Boolean(values.title && values.title.trim() !== "");
	const hasTargetLang = Boolean(
		values.targetLang && values.targetLang.trim() !== "",
	);
	return !hasSource || !hasTitle || !hasTargetLang;
}
