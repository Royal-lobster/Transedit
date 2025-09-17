"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { loadProject, upsertProject } from "@/lib/db";
import {
	stats as computeStats,
	debounce,
	downloadFile,
	type FlatMap,
	mergeProgress,
	parseTransEditFromHash,
	parseTransEditUpload,
	type TransEditFile,
	toLocaleJson,
} from "@/lib/transedit";

export type ReviewFormValues = {
	translations: string[];
	search: string;
	transFile: File | null;
	note?: string;
};

export function useReview() {
	const form = useForm<ReviewFormValues>({
		defaultValues: { translations: [], search: "", transFile: null, note: "" },
		mode: "onChange",
	});

	const [model, setModel] = useState<TransEditFile | null>(null);
	const [error, setError] = useState<string | null>(null);

	const keys = useMemo(
		() => (model ? Object.keys(model.en).sort() : []),
		[model],
	);

	const arrayToMap = useCallback(
		(arr: string[]): FlatMap => {
			const m: FlatMap = {};
			for (let i = 0; i < keys.length; i++) m[keys[i]] = String(arr[i] ?? "");
			return m;
		},
		[keys],
	);

	// Reactively watch form fields that affect derived data
	const searchValue = useWatch({ control: form.control, name: "search" });
	const translationsValue = useWatch({
		control: form.control,
		name: "translations",
		defaultValue: [],
	});

	const filteredIndices = useMemo(() => {
		const q = String(searchValue ?? "")
			.toLowerCase()
			.trim();
		if (!model) return [];
		if (!q) return keys.map((_, i) => i);
		const en = model.en;
		const t = arrayToMap((translationsValue as string[]) ?? []);
		const out: number[] = [];
		keys.forEach((k, i) => {
			const enVal = String(en[k] ?? "").toLowerCase();
			const trVal = String(t[k] ?? "").toLowerCase();
			if (k.toLowerCase().includes(q) || enVal.includes(q) || trVal.includes(q))
				out.push(i);
		});
		return out;
	}, [searchValue, translationsValue, keys, model, arrayToMap]);

	const pickFileAndLoad = useCallback(
		async (file: File) => {
			setError(null);
			try {
				const parsed = await parseTransEditUpload(file);
				const prior = await loadProject(parsed.id);
				const merged = prior ? mergeProgress(parsed, prior.target) : parsed;

				setModel(merged);
				const keysSorted = Object.keys(merged.en).sort();
				const initialTranslations = keysSorted.map(
					(k) => merged.target[k] ?? "",
				);
				form.reset({
					translations: initialTranslations,
					search: "",
					transFile: file,
					note: "",
				});

				// Upsert immediately so it appears on dashboard even before edits
				await upsertProject({
					id: merged.id,
					meta: merged.meta,
					en: merged.en,
					target: merged.target,
					updatedAt: new Date().toISOString(),
				});
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				setError(msg);
			}
		},
		[form],
	);

	// Load from URL hash on mount: supports encoded data or plain id
	useEffect(() => {
		if (model) return;
		if (typeof window === "undefined") return;
		const h = window.location.hash;
		if (!h) return;
		(async () => {
			try {
				const fromHash = parseTransEditFromHash(h);
				if (fromHash) {
					const prior = await loadProject(fromHash.id);
					const merged = prior
						? mergeProgress(fromHash, prior.target)
						: fromHash;
					setModel(merged);
					const keysSorted = Object.keys(merged.en).sort();
					const initialTranslations = keysSorted.map(
						(k) => merged.target[k] ?? "",
					);
					form.reset({
						translations: initialTranslations,
						search: "",
						transFile: null,
						note: "",
					});

					// Upsert immediately so it appears on dashboard
					await upsertProject({
						id: merged.id,
						meta: merged.meta,
						en: merged.en,
						target: merged.target,
						updatedAt: new Date().toISOString(),
					});
					return;
				}

				// Fallback: interpret hash as a plain id
				const clean = h.startsWith("#") ? h.slice(1) : h;
				if (clean && !clean.includes("=")) {
					const prior = await loadProject(clean);
					if (prior) {
						const merged = {
							id: prior.id,
							meta: prior.meta,
							en: prior.en,
							target: prior.target,
						} as TransEditFile;
						setModel(merged);
						const keysSorted = Object.keys(merged.en).sort();
						const initialTranslations = keysSorted.map(
							(k) => merged.target[k] ?? "",
						);
						form.reset({
							translations: initialTranslations,
							search: "",
							transFile: null,
							note: "",
						});
					}
				}
			} catch {
				// ignore
			}
		})();
	}, [form, model]);

	const onTransFileChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const f = e.target.files?.[0] ?? null;
			if (!f) return;
			await pickFileAndLoad(f);
			e.currentTarget.value = "";
		},
		[pickFileAndLoad],
	);

	const debouncedSaveRef = useRef(
		debounce(
			async (
				id: string,
				targetMap: FlatMap,
				meta: TransEditFile["meta"],
				en: FlatMap,
			) => {
				await upsertProject({
					id,
					meta,
					en,
					target: targetMap,
					updatedAt: new Date().toISOString(),
				});
			},
			600,
		),
	);

	useEffect(() => {
		const subscription = form.watch(async (value, info) => {
			if (!model) return;
			if (info.name?.startsWith("translations")) {
				const arr = (value.translations ?? []) as string[];
				const map = arrayToMap(arr);
				debouncedSaveRef.current(model.id, map, model.meta, model.en);
			}
		});
		return () => subscription.unsubscribe();
	}, [form, model, arrayToMap]);

	const liveStats = useMemo(() => {
		if (!model) return { total: 0, translated: 0, percent: 0 };
		const arr = form.getValues("translations") ?? [];
		const map = arrayToMap(arr);
		const temp: TransEditFile = { ...model, target: map };
		return computeStats(temp);
	}, [form, model, arrayToMap]);

	const onDownloadLocale = useCallback(() => {
		if (!model) return;
		const arr = form.getValues("translations") ?? [];
		const map = arrayToMap(arr);
		const filename = `${model.meta.targetLang}.json`;
		downloadFile(filename, toLocaleJson(map), "application/json");
	}, [form, model, arrayToMap]);

	return {
		form,
		model,
		error,
		keys,
		filteredIndices,
		pickFileAndLoad,
		onTransFileChange,
		onDownloadLocale,
		liveStats,
	};
}
