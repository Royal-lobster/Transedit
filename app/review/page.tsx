"use client";

import {
	Download,
	History,
	Save,
	Search,
	Sparkles,
	Undo2,
	Upload,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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

type FormValues = {
	translations: string[];
	search: string;
	note: string;
	transFile: File | null;
};

export default function ReviewPage() {
	const form = useForm<FormValues>({
		defaultValues: {
			translations: [],
			search: "",
			note: "",
			transFile: null,
		},
		mode: "onChange",
	});

	const [model, setModel] = useState<TransEditFile | null>(null);
	const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
	const [error, setError] = useState<string | null>(null);

	// Stable key ordering
	const keys = useMemo(
		() => (model ? Object.keys(model.en).sort() : []),
		[model],
	);

	// Map current form translations array back to key->value map
	const arrayToMap = useCallback(
		(arr: string[]): FlatMap => {
			const m: FlatMap = {};
			for (let i = 0; i < keys.length; i++) {
				m[keys[i]] = String(arr[i] ?? "");
			}
			return m;
		},
		[keys],
	);

	// Filtered indices for UI based on search
	const filteredIndices = useMemo(() => {
		const q = (form.getValues("search") ?? "").toLowerCase().trim();
		if (!q || !model) return keys.map((_, i) => i);
		const en = model.en;
		const t = arrayToMap(form.getValues("translations") ?? []);
		const out: number[] = [];
		keys.forEach((k, i) => {
			const enVal = String(en[k] ?? "").toLowerCase();
			const trVal = String(t[k] ?? "").toLowerCase();
			if (
				k.toLowerCase().includes(q) ||
				enVal.includes(q) ||
				trVal.includes(q)
			) {
				out.push(i);
			}
		});
		return out;
	}, [form, keys, model, arrayToMap]);

	const pickFileAndLoad = useCallback(
		async (file: File) => {
			setError(null);
			try {
				const parsed = await parseTransEditUpload(file);
				// If we have prior progress in IndexedDB, merge it in
				const prior = await loadProject(parsed.id);
				const merged = prior ? mergeProgress(parsed, prior.target) : parsed;

				setModel(merged);

				// Initialize form translations array following sorted keys
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

				// Load snapshots
				const snaps = await listSnapshots(merged.id);
				setSnapshots(snaps);
			} catch (e: any) {
				setError(e?.message ?? String(e));
			}
		},
		[form],
	);

	// Load from URL hash (share link) on mount
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
			} catch (e) {
				// ignore bad hash
			}
		})();
	}, [form, model]);

	// File selection handler
	const onTransFileChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const f = e.target.files?.[0] ?? null;
			if (!f) return;
			await pickFileAndLoad(f);
			// clear value to allow re-upload same file if needed
			e.currentTarget.value = "";
		},
		[pickFileAndLoad],
	);

	// Autosave to IndexedDB when translations change
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

	// Compute progress from form values (live)
	const liveStats = useMemo(() => {
		if (!model) return { total: 0, translated: 0, percent: 0 };
		const arr = form.getValues("translations") ?? [];
		const map = arrayToMap(arr);
		const temp: TransEditFile = { ...model, target: map };
		return computeStats(temp);
	}, [form, model, arrayToMap]);

	// Snapshot save
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

	// Download updated locale.json
	const onDownloadLocale = useCallback(() => {
		if (!model) return;
		const arr = form.getValues("translations") ?? [];
		const map = arrayToMap(arr);
		const filename = `${model.meta.targetLang}.json`;
		downloadFile(filename, toLocaleJson(map), "application/json");
	}, [form, model, arrayToMap]);

	return (
		<div className="min-h-screen w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
			<div className="mx-auto max-w-6xl px-6 py-10">
				<div className="mb-8 flex items-center gap-3">
					<Sparkles className="h-6 w-6 text-sky-400" />
					<h1 className="text-2xl font-semibold tracking-tight">
						Review Translations
					</h1>
				</div>

				<Form {...form}>
					{!model ? (
						<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur">
							<p className="mb-4 text-sm text-zinc-300">
								Upload a .transedit file to open the review dashboard. Your
								edits auto-save to your browser.
							</p>

							<div className="grid gap-2">
								<FormField
									control={form.control}
									name="transFile"
									render={({ field }) => (
										<FormItem>
											<FormLabel>.transedit file</FormLabel>
											<FormControl>
												<Input
													type="file"
													accept=".transedit,application/json"
													onChange={(e) => {
														const f = e.target.files?.[0] ?? null;
														field.onChange(f);
														// immediately process selection
														if (f) {
															pickFileAndLoad(f);
														}
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{error && (
								<div className="mt-4 rounded-md border border-red-900/40 bg-red-950/40 p-3 text-sm text-red-300">
									{error}
								</div>
							)}

							<div className="mt-6">
								<Button asChild variant="outline" className="gap-2">
									<Link href="/">
										<Undo2 className="h-4 w-4" />
										Back to Home
									</Link>
								</Button>
							</div>
						</div>
					) : (
						<div className="space-y-6">
							<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<p className="text-sm text-zinc-400">
											Source:{" "}
											<span className="text-zinc-200 font-medium">
												{model.meta.sourceLang}
											</span>{" "}
											• Target:{" "}
											<span className="text-zinc-200 font-medium">
												{model.meta.targetLang}
											</span>
										</p>
										<p className="text-xs text-zinc-500">
											Project ID:{" "}
											<span className="text-zinc-400">{model.id}</span>
										</p>
									</div>
									<div className="min-w-[220px]">
										<Progress value={liveStats.percent} />
										<p className="mt-1 text-right text-xs text-zinc-400">
											{liveStats.translated}/{liveStats.total} •{" "}
											{liveStats.percent}%
										</p>
									</div>
								</div>

								<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div className="sm:w-80">
										<div className="flex items-center gap-2">
											<Search className="h-4 w-4 text-zinc-500" />
											<FormField
												control={form.control}
												name="search"
												render={({ field }) => (
													<FormItem className="w-full">
														<FormControl>
															<Input
																placeholder="Search key, English, or translation..."
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>

									<div className="flex gap-2">
										<Button
											type="button"
											variant="secondary"
											className="gap-2"
											onClick={onSaveSnapshot}
										>
											<Save className="h-4 w-4" />
											Save snapshot
										</Button>
										<Button
											type="button"
											variant="outline"
											className="gap-2"
											onClick={onDownloadLocale}
										>
											<Download className="h-4 w-4" />
											Download {model.meta.targetLang}.json
										</Button>
										<Button
											type="button"
											variant="outline"
											asChild
											className="gap-2"
										>
											<label className="cursor-pointer">
												<Upload className="h-4 w-4" />
												Load another .transedit
												<input
													type="file"
													accept=".transedit,application/json"
													className="hidden"
													onChange={onTransFileChange}
												/>
											</label>
										</Button>
									</div>
								</div>
							</div>

							<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
								{/* Editor list */}
								<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
									{filteredIndices.length === 0 ? (
										<p className="text-sm text-zinc-400">No matches.</p>
									) : (
										<ul className="space-y-4">
											{filteredIndices.map((i) => {
												const k = keys[i];
												const en = String(model.en[k] ?? "");
												return (
													<li
														key={k}
														className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3"
													>
														<div className="mb-2 flex items-start justify-between gap-3">
															<div className="min-w-0">
																<p className="truncate text-xs text-zinc-500">
																	{k}
																</p>
																<p className="mt-1 text-sm text-zinc-300">
																	{en}
																</p>
															</div>
														</div>
														<FormField
															control={form.control}
															name={`translations.${i}` as const}
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="sr-only">
																		Translation
																	</FormLabel>
																	<FormControl>
																		<Textarea
																			rows={3}
																			placeholder="Enter translation..."
																			value={field.value ?? ""}
																			onChange={field.onChange}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</li>
												);
											})}
										</ul>
									)}
									<p className="mt-4 text-xs text-zinc-500">
										Edits auto-save locally. Undo/redo supported via your
										browser's standard shortcuts.
									</p>
								</div>

								{/* Sidebar: snapshots */}
								<aside className="space-y-4">
									<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
										<div className="mb-3 flex items-center gap-2">
											<History className="h-4 w-4 text-zinc-400" />
											<h3 className="text-sm font-medium">Snapshots</h3>
										</div>
										<FormField
											control={form.control}
											name="note"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Note</FormLabel>
													<FormControl>
														<Input
															placeholder="Optional note for snapshot..."
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button
											type="button"
											className="mt-3 w-full gap-2"
											onClick={onSaveSnapshot}
										>
											<Save className="h-4 w-4" />
											Save snapshot
										</Button>
										<div className="mt-4 max-h-[320px] overflow-auto">
											{snapshots.length === 0 ? (
												<p className="text-xs text-zinc-500">
													No snapshots yet.
												</p>
											) : (
												<ul className="space-y-2">
													{snapshots.map((s) => (
														<li
															key={s.id}
															className="rounded-md border border-zinc-800/80 bg-zinc-900/60 p-2"
														>
															<p className="text-xs text-zinc-400">
																{new Date(s.at).toLocaleString()}{" "}
																{s.note ? `• ${s.note}` : ""}
															</p>
														</li>
													))}
												</ul>
											)}
										</div>
									</div>

									<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
										<Button asChild variant="outline" className="w-full gap-2">
											<Link href="/">
												<Undo2 className="h-4 w-4" />
												Back to Home
											</Link>
										</Button>
									</div>
								</aside>
							</div>
						</div>
					)}
				</Form>
			</div>
		</div>
	);
}
