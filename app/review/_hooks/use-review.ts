"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { loadProject, upsertProject } from "@/lib/db";
import {
	stats as computeStats,
	debounce,
	downloadFile,
	type FlatMap,
	mergeProgress,
	parseTransEditFromSearch,
	type TransEditFile,
	toLocaleJson,
} from "@/lib/helpers/transedit";

export type ReviewFormValues = {
	translations: string[];
	search: string;
	note?: string;
};

export function useReview(opts?: { id?: string | null; data?: string | null }) {
	const form = useForm<ReviewFormValues>({
		defaultValues: { translations: [], search: "", note: "" },
		mode: "onChange",
	});

	const [model, setModel] = useState<TransEditFile | null>(null);

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

	// Query: load model based on query params (inline data or plain id)
	const idParam = opts?.id ?? null;
	const dataParam = opts?.data ?? null;
	const { data, isLoading, isError, error } = useQuery<
		TransEditFile,
		Error,
		TransEditFile,
		(string | null)[]
	>({
		queryKey: ["review", idParam, dataParam],
		enabled: (!!idParam || !!dataParam) && !model,
		queryFn: async () => {
			if (dataParam) {
				const fromQuery = parseTransEditFromSearch(`?data=${dataParam}`);
				if (!fromQuery) throw new Error("Invalid review link");
				const prior = await loadProject(fromQuery.id);
				const merged = prior
					? mergeProgress(fromQuery, prior.target)
					: fromQuery;

				// Upsert immediately so it appears on dashboard
				await upsertProject({
					id: merged.id,
					meta: merged.meta,
					en: merged.en,
					target: merged.target,
					updatedAt: new Date().toISOString(),
				});
				return merged;
			}

			if (idParam) {
				const prior = await loadProject(idParam);
				if (!prior) throw new Error("Review not found");
				const merged = {
					id: prior.id,
					meta: prior.meta,
					en: prior.en,
					target: prior.target,
				} as TransEditFile;
				return merged;
			}
			throw new Error("Invalid review link");
		},
	});

	// Initialize form/model when query yields data
	useEffect(() => {
		if (!data) return;
		setModel(data);
		const keysSorted = Object.keys(data.en).sort();
		const initialTranslations = keysSorted.map((k) => data.target[k] ?? "");
		form.reset({ translations: initialTranslations, search: "", note: "" });
	}, [data, form]);

	// Normalize URL: if loaded via ?data=..., replace it with ?id=<id>
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!data || !dataParam) return;
		const params = new URLSearchParams(window.location.search);
		if (params.has("data")) {
			params.delete("data");
			params.set("id", data.id);
			const newQs = params.toString();
			const newUrl = `${location.origin}${location.pathname}${newQs ? `?${newQs}` : ""}`;
			window.history.replaceState(null, "", newUrl);
		}
	}, [data, dataParam]);

	const upsertMutation = useMutation({
		mutationFn: upsertProject,
	});

	const debouncedSaveRef = useRef(
		debounce(
			async (
				id: string,
				targetMap: FlatMap,
				meta: TransEditFile["meta"],
				en: FlatMap,
			) => {
				upsertMutation.mutate({
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
		keys,
		filteredIndices,
		onDownloadLocale,
		liveStats,
		isLoading,
		isError,
		error,
		// No bootstrapping needed when params come from the page
	};
}
