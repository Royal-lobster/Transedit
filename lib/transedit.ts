// Utility types and helpers for TransEdit workflow: flatten/unflatten, file IO, generators, merging, and stats.

export type FlatMap = Record<string, string>;

export interface TransEditMeta {
	app: "transedit";
	version: 1;
	sourceLang: string; // e.g., "en"
	targetLang: string; // e.g., "ko"
	createdAt: string; // ISO
}

export interface TransEditFile {
	id: string; // stable id for project
	meta: TransEditMeta;
	en: FlatMap; // flattened english
	target: FlatMap; // flattened target translations (may contain "")
}

/**
 * Flatten nested JSON object (strings, objects, arrays) into dot-path keys.
 * Arrays use numeric indices in the path.
 */
export function flatten(input: unknown, prefix = ""): FlatMap {
	const out: FlatMap = {};
	const pathJoin = (a: string, b: string) => (a ? `${a}.${b}` : b);

	const visit = (value: unknown, pfx: string) => {
		if (value == null) {
			out[pfx] = "";
			return;
		}
		if (
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "boolean"
		) {
			out[pfx] = String(value);
			return;
		}
		if (Array.isArray(value)) {
			if (value.length === 0) {
				out[pfx] = "";
				return;
			}
			value.forEach((v, i) => {
				visit(v, pfx ? `${pfx}.${i}` : String(i));
			});
			return;
		}
		if (typeof value === "object") {
			const obj = value as Record<string, unknown>;
			const keys = Object.keys(obj);
			if (keys.length === 0) {
				out[pfx] = "";
				return;
			}
			for (const k of keys) {
				const np = pathJoin(pfx, k);
				visit(obj[k], np);
			}
			return;
		}
		out[pfx] = "";
	};

	if (prefix) {
		visit(input, prefix);
	} else {
		if (typeof input === "object" && input && !Array.isArray(input)) {
			for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
				visit(v, k);
			}
		} else {
			visit(input, "");
		}
	}
	return out;
}

/**
 * Unflatten a dot-path FlatMap back into a nested JSON object.
 * Values are strings. Consumers can convert types later if needed.
 */
export function unflatten(flat: FlatMap): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	const setPath = (
		obj: Record<string, unknown>,
		path: string[],
		value: string,
	) => {
		let curr: any = obj;
		for (let i = 0; i < path.length; i++) {
			const part = path[i];
			const isLast = i === path.length - 1;
			const nextPart = path[i + 1];

			// Detect if next should be array (numeric index)
			const nextIsIndex = nextPart != null && /^\d+$/.test(nextPart);

			if (isLast) {
				curr[part] = value;
			} else {
				if (!(part in curr)) {
					curr[part] = nextIsIndex ? [] : {};
				} else {
					// If type mismatch, coerce to object/array as needed
					if (nextIsIndex && !Array.isArray(curr[part])) curr[part] = [];
					if (
						!nextIsIndex &&
						(Array.isArray(curr[part]) || typeof curr[part] !== "object")
					)
						curr[part] = {};
				}
				curr = curr[part];
			}
		}
	};

	for (const [k, v] of Object.entries(flat)) {
		if (!k) continue;
		const parts = k.split(".");
		setPath(result, parts, v);
	}
	return result;
}

export function isBrowser() {
	return typeof window !== "undefined";
}

export function uuid(): string {
	if (isBrowser() && "crypto" in window && "randomUUID" in window.crypto) {
		return window.crypto.randomUUID();
	}
	// Fallback simple uuid v4-ish (not cryptographically strong)
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export function nowIso(): string {
	return new Date().toISOString();
}

export function safeJsonParse<T = unknown>(text: string): T {
	try {
		return JSON.parse(text) as T;
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw new Error(`Invalid JSON: ${msg}`);
	}
}

export async function readFileAsText(file: File): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.onabort = () => reject(new Error("File read aborted"));
		reader.onload = () => resolve(String(reader.result ?? ""));
		reader.readAsText(file);
	});
}

export async function readJsonFromFile<T = unknown>(file: File): Promise<T> {
	const text = await readFileAsText(file);
	return safeJsonParse<T>(text);
}

export function downloadFile(
	filename: string,
	content: string,
	mime = "application/octet-stream",
) {
	if (!isBrowser()) return;
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

// Build .transedit model from en + optional target JSON objects
export function generateTransEditFile(opts: {
	enObject: unknown;
	targetObject?: unknown | null;
	sourceLang?: string; // default "en"
	targetLang: string; // required
	id?: string; // optional to reuse existing
}): TransEditFile {
	const en = flatten(opts.enObject ?? {});
	const target = flatten(opts.targetObject ?? {});
	// Align target to en keys (missing -> "")
	const aligned: FlatMap = {};
	for (const k of Object.keys(en)) {
		aligned[k] = k in target ? String(target[k] ?? "") : "";
	}
	return {
		id: opts.id ?? uuid(),
		meta: {
			app: "transedit",
			version: 1,
			sourceLang: (opts.sourceLang ?? "en") as "en",
			targetLang: opts.targetLang,
			createdAt: nowIso(),
		},
		en,
		target: aligned,
	};
}

// Parse uploaded .transedit file content
export async function parseTransEditUpload(file: File): Promise<TransEditFile> {
	const data = await readJsonFromFile<TransEditFile>(file);
	validateTransEdit(data);
	return data;
}

export function validateTransEdit(data: any): asserts data is TransEditFile {
	if (!data || typeof data !== "object")
		throw new Error("Invalid .transedit: not an object");
	if (!data.id || typeof data.id !== "string")
		throw new Error("Invalid .transedit: missing id");
	if (!data.meta || typeof data.meta !== "object")
		throw new Error("Invalid .transedit: missing meta");
	if (data.meta.app !== "transedit")
		throw new Error("Invalid .transedit: meta.app must be 'transedit'");
	if (data.meta.version !== 1)
		throw new Error("Invalid .transedit: unsupported version");
	if (!data.meta.sourceLang || !data.meta.targetLang)
		throw new Error("Invalid .transedit: missing languages");
	if (!data.en || typeof data.en !== "object")
		throw new Error("Invalid .transedit: missing en");
	if (!data.target || typeof data.target !== "object")
		throw new Error("Invalid .transedit: missing target");
}

// Merge a base transedit with previous progress (target map overrides). Drop keys not in base.en.
export function mergeProgress(
	base: TransEditFile,
	priorTarget?: FlatMap | null,
): TransEditFile {
	const merged: FlatMap = {};
	const pt = priorTarget ?? {};
	for (const k of Object.keys(base.en)) {
		merged[k] = k in pt ? String(pt[k] ?? "") : String(base.target[k] ?? "");
	}
	return {
		...base,
		target: merged,
	};
}

export function stats(trans: TransEditFile) {
	const keys = Object.keys(trans.en);
	const total = keys.length;
	let translated = 0;
	for (const k of keys) {
		if ((trans.target[k] ?? "").trim() !== "") translated++;
	}
	return {
		total,
		translated,
		percent: total === 0 ? 100 : Math.round((translated / total) * 100),
	};
}

export function toLocaleJson(target: FlatMap): string {
	const obj = unflatten(target);
	return JSON.stringify(obj, null, 2);
}

export function toTransEditJson(model: TransEditFile): string {
	return JSON.stringify(model, null, 2);
}

// Simple debounce for autosave
export function debounce<T extends (...args: any[]) => void>(
	fn: T,
	delay = 500,
) {
	let t: any;
	return (...args: Parameters<T>) => {
		clearTimeout(t);
		t = setTimeout(() => fn(...args), delay);
	};
}

// --- Share-link helpers (encode/decode .transedit into URL hash) ---

function b64urlEncodeUtf8(input: string): string {
	// Encode arbitrary unicode safely to base64url
	const utf8 = new TextEncoder().encode(input);
	let binary = "";
	for (let i = 0; i < utf8.length; i++) binary += String.fromCharCode(utf8[i]);
	const b64 = btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
	return b64;
}

function b64urlDecodeUtf8(input: string): string {
	const b64 =
		input.replace(/-/g, "+").replace(/_/g, "/") +
		"===".slice((input.length + 3) % 4);
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return new TextDecoder().decode(bytes);
}

/**
 * Returns hash segment like: data=<base64url(JSON)>
 */
export function encodeTransEditToHash(model: TransEditFile): string {
	const json = JSON.stringify(model);
	const data = b64urlEncodeUtf8(json);
	return `data=${data}`;
}

/**
 * Builds a shareable URL for the current origin that opens the Review page
 * and loads the model from the hash.
 */
export function buildShareUrl(model: TransEditFile): string {
	if (!isBrowser()) return `#/review?unsupported`;
	const base = `${location.origin}/review`;
	const hash = encodeTransEditToHash(model);
	return `${base}#${hash}`;
}

/**
 * Parses window.location.hash and returns a TransEditFile if present/valid, else null.
 */
export function parseTransEditFromHash(hash: string): TransEditFile | null {
	if (!hash) return null;
	const clean = hash.startsWith("#") ? hash.slice(1) : hash;
	const params = new URLSearchParams(
		clean.includes("=") ? clean : `data=${clean}`,
	);
	const data = params.get("data");
	if (!data) return null;
	try {
		const json = b64urlDecodeUtf8(data);
		const obj = JSON.parse(json);
		validateTransEdit(obj);
		return obj as TransEditFile;
	} catch {
		return null;
	}
}
