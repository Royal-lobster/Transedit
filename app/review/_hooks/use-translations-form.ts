"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { loadProject, upsertProject } from "@/lib/db";
import {
	stats as computeStats,
	debounce,
	downloadFile,
	type FlatMap,
	type TransEditFile,
	toLocaleJson,
	toTransEditJson,
} from "@/lib/helpers/transedit";

export type ReviewFormValues = {
	translations: string[];
	search: string;
	note?: string;
};

export function useTranslationsForm(model: TransEditFile | null) {
	const form = useForm<ReviewFormValues>({
		defaultValues: { translations: [], search: "", note: "" },
		mode: "onChange",
	});

	const keys = useMemo(
		() => (model ? Object.keys(model.en).sort() : []),
		[model],
	);

	// Verified checklist state (local-only)
	const [verified, setVerified] = useState<Record<string, boolean>>({});
	const verifiedRef = useRef<Record<string, boolean>>({});
	useEffect(() => {
		verifiedRef.current = verified;
	}, [verified]);

	const arrayToMap = useCallback(
		(arr: string[]): FlatMap => {
			const m: FlatMap = {};
			for (let i = 0; i < keys.length; i++) m[keys[i]] = String(arr[i] ?? "");
			return m;
		},
		[keys],
	);

	// Initialize form from model
	useEffect(() => {
		if (!model) return;
		const keysSorted = Object.keys(model.en).sort();
		const initialTranslations = keysSorted.map((k) => model.target[k] ?? "");
		form.reset({ translations: initialTranslations, search: "", note: "" });

		// Load verified map (if exists)
		loadProject(model.id)
			.then((row) => {
				setVerified(row?.verified ?? {});
			})
			.catch(() => setVerified({}));
	}, [model, form]);

	// Derived search/filter
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
		if (!model) return [] as number[];
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

	// Autosave
	const upsertMutation = useMutation({ mutationFn: upsertProject });
	const debouncedSaveRef = useRef(
		debounce(
			async (
				id: string,
				targetMap: FlatMap,
				meta: TransEditFile["meta"],
				en: FlatMap,
				verifiedMap: Record<string, boolean>,
			) => {
				upsertMutation.mutate({
					id,
					meta,
					en,
					target: targetMap,
					verified: verifiedMap,
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
				// If a specific index changed, auto-unverify it (content changed)
				const m = info.name.match(/^translations\.(\d+)$/);
				if (m) {
					const idx = Number(m[1]);
					const key = keys[idx];
					if (key) {
						setVerified((prev) => {
							if (!prev[key]) return prev;
							const next = { ...prev } as Record<string, boolean>;
							delete next[key];
							// Persist immediately with updated verified map
							debouncedSaveRef.current(
								model.id,
								map,
								model.meta,
								model.en,
								next,
							);
							return next;
						});
					}
				}
				debouncedSaveRef.current(
					model.id,
					map,
					model.meta,
					model.en,
					verifiedRef.current,
				);
			}
		});
		return () => subscription.unsubscribe();
	}, [form, model, arrayToMap, keys]);

	// Live stats
	// Use the watched `translationsValue` so stats update when the form is
	// initialized via `form.reset()` (for example after loading a model on
	// page refresh). Relying on `form` object reference prevented
	// recomputation when values changed.
	const liveStats = useMemo(() => {
		if (!model) return { total: 0, translated: 0, percent: 0 };
		const arr = (translationsValue as string[]) ?? [];
		const map = arrayToMap(arr);
		const temp: TransEditFile = { ...model, target: map };
		return computeStats(temp);
	}, [translationsValue, model, arrayToMap]);

	// Review/verified stats
	const reviewStats = useMemo(() => {
		const total = keys.length;
		let reviewed = 0;
		for (const k of keys) if (verified[k]) reviewed++;
		return {
			total,
			reviewed,
			percent: total === 0 ? 100 : Math.round((reviewed / total) * 100),
		};
	}, [keys, verified]);

	// Downloads
	const onDownloadLocale = useCallback(() => {
		if (!model) return;
		const arr = form.getValues("translations") ?? [];
		const map = arrayToMap(arr);
		const filename = `${model.meta.targetLang}.json`;
		downloadFile(filename, toLocaleJson(map), "application/json");
	}, [form, model, arrayToMap]);

	const onDownloadTransedit = useCallback(() => {
		if (!model) return;
		const arr = form.getValues("translations") ?? [];
		const map = arrayToMap(arr);
		const current: TransEditFile = { ...model, target: map };
		const json = toTransEditJson(current);
		const filename = `${model.meta.sourceLang}-${model.meta.targetLang}.transedit`;
		downloadFile(filename, json, "application/json");
	}, [form, model, arrayToMap]);

	// Toggle verification for an index
	const isVerified = useCallback(
		(index: number) => {
			const key = keys[index];
			return !!verified[key];
		},
		[keys, verified],
	);

	const setVerifiedByIndex = useCallback(
		(index: number, value: boolean) => {
			const key = keys[index];
			setVerified((prev) => {
				const next = { ...prev, [key]: value } as Record<string, boolean>;
				if (model) {
					const arr = form.getValues("translations") ?? [];
					const map = arrayToMap(arr);
					debouncedSaveRef.current(model.id, map, model.meta, model.en, next);
				}
				return next;
			});
		},
		[form, arrayToMap, keys, model],
	);

	return {
		form,
		keys,
		filteredIndices,
		liveStats,
		reviewStats,
		verified,
		isVerified,
		setVerifiedByIndex,
		onDownloadLocale,
		onDownloadTransedit,
	} as const;
}
