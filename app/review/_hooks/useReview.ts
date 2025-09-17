"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
	listSnapshots,
	loadProject,
	type SnapshotRow,
	saveSnapshot,
	upsertProject,
} from "@/lib/db";
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
	note: string;
	transFile: File | null;
};

export function useReview() {
	const form = useForm<ReviewFormValues>({
		defaultValues: { translations: [], search: "", note: "", transFile: null },
		mode: "onChange",
	});

	const [model, setModel] = useState<TransEditFile | null>(null);
	const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
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

	const filteredIndices = useMemo(() => {
		const q = (form.getValues("search") ?? "").toLowerCase().trim();
		if (!q || !model) return keys.map((_, i) => i);
		const en = model.en;
		const t = arrayToMap(form.getValues("translations") ?? []);
		const out: number[] = [];
		keys.forEach((k, i) => {
			const enVal = String(en[k] ?? "").toLowerCase();
			const trVal = String(t[k] ?? "").toLowerCase();
			if (k.toLowerCase().includes(q) || enVal.includes(q) || trVal.includes(q))
				out.push(i);
		});
		return out;
	}, [form, keys, model, arrayToMap]);

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
					note: "",
					transFile: file,
				});

				const snaps = await listSnapshots(merged.id);
				setSnapshots(snaps);
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				setError(msg);
			}
		},
		[form],
	);

	// Load from URL hash on mount
	useEffect(() => {
		if (model) return;
		if (typeof window === "undefined") return;
		const h = window.location.hash;
		if (!h) return;
		(async () => {
			try {
				const fromHash = parseTransEditFromHash(h);
				if (!fromHash) return;
				const prior = await loadProject(fromHash.id);
				const merged = prior ? mergeProgress(fromHash, prior.target) : fromHash;
				setModel(merged);
				const keysSorted = Object.keys(merged.en).sort();
				const initialTranslations = keysSorted.map(
					(k) => merged.target[k] ?? "",
				);
				form.reset({
					translations: initialTranslations,
					search: "",
					note: "",
					transFile: null,
				});
				const snaps = await listSnapshots(merged.id);
				setSnapshots(snaps);
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

	const onSaveSnapshot = useCallback(async () => {
		if (!model) return;
		const arr = form.getValues("translations") ?? [];
		const map = arrayToMap(arr);
		const note = form.getValues("note")?.trim() || undefined;
		const at = new Date().toISOString();
		await saveSnapshot({
			id: crypto.randomUUID(),
			projectId: model.id,
			at,
			target: map,
			note,
		});
		const snaps = await listSnapshots(model.id);
		setSnapshots(snaps);
		form.setValue("note", "");
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
		snapshots,
		error,
		keys,
		filteredIndices,
		pickFileAndLoad,
		onTransFileChange,
		onSaveSnapshot,
		onDownloadLocale,
		liveStats,
	};
}
