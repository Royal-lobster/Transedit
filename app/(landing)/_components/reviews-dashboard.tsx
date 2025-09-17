"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowRight,
	Check,
	Clock,
	Copy,
	Languages,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteProject, listProjects, type ProjectRow } from "@/lib/db";
import { range } from "@/lib/helpers/range";

export function ReviewsDashboard() {
	const qc = useQueryClient();
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["projects"],
		queryFn: listProjects,
	});

	const onDelete = async (id: string) => {
		const ok = window.confirm("Delete this review? This cannot be undone.");
		if (!ok) return;
		await deleteProject(id);
		await qc.invalidateQueries({ queryKey: ["projects"] });
		await refetch();
	};

	const items = (data ?? []) as ProjectRow[];

	return (
		<div>
			<h3 className="mb-3 text-base font-semibold tracking-tight">
				Your reviews
			</h3>
			{isLoading ? (
				<ul className="space-y-3">
					{range(3).map((n) => (
						<li key={`skeleton-${n}`}>
							<Card>
								<CardContent>
									<div className="flex items-center justify-between gap-3">
										<div className="min-w-0 flex-1 space-y-2">
											<Skeleton className="h-4 w-40" />
											<div className="flex items-center gap-2">
												<Skeleton className="h-5 w-16" />
												<Skeleton className="h-3 w-32" />
											</div>
											<Skeleton className="h-3 w-52" />
										</div>
										<div className="flex items-center gap-2">
											<Skeleton className="h-8 w-16" />
											<Skeleton className="h-8 w-8" />
										</div>
									</div>
								</CardContent>
							</Card>
						</li>
					))}
				</ul>
			) : isError ? (
				<div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
					Failed to load your reviews. Try again.
				</div>
			) : items.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					No reviews yet. Import or create one to get started.
				</p>
			) : (
				<ul className="space-y-3">
					{items.map((p) => (
						<ReviewItem key={p.id} item={p} onDelete={onDelete} />
					))}
				</ul>
			)}
		</div>
	);
}

type ReviewItemProps = {
	item: ProjectRow;
	onDelete: (id: string) => void;
};

function ReviewItem({ item, onDelete }: ReviewItemProps) {
	const [copied, setCopied] = useState(false);

	const copyId = async () => {
		try {
			await navigator.clipboard.writeText(item.id);
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch {
			// noop
		}
	};

	return (
		<li>
			<Card className="group">
				<CardContent>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2">
								<div className="text-sm font-medium truncate">
									{item.meta.title}
								</div>
								<Badge variant="secondary" className="shrink-0">
									<Languages className="mr-1 h-3 w-3" />
									{item.meta.sourceLang} → {item.meta.targetLang}
								</Badge>
							</div>
							<div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
								<span className="truncate font-mono">{item.id}</span>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6"
									aria-label="Copy ID"
									onClick={copyId}
								>
									{copied ? (
										<Check className="h-3.5 w-3.5" />
									) : (
										<Copy className="h-3.5 w-3.5" />
									)}
								</Button>
							</div>
							<div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
								<Clock className="h-3.5 w-3.5" />
								<span>Updated {new Date(item.updatedAt).toLocaleString()}</span>
							</div>
						</div>
						<div className="flex items-center gap-2 self-end sm:self-auto">
							<Button asChild size="sm" variant="outline" className="gap-1">
								<Link href={`/review?id=${encodeURIComponent(item.id)}`}>
									Open
									<ArrowRight className="ml-1 h-4 w-4" />
								</Link>
							</Button>
							<Button
								variant="destructive"
								size="sm"
								aria-label="Delete review"
								onClick={() => onDelete(item.id)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</li>
	);
}
