"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteProject, listProjects, type ProjectRow } from "@/lib/db";

export function ReviewsDashboard() {
	const [items, setItems] = useState<ProjectRow[]>([]);
	const [loading, setLoading] = useState(true);

	const refresh = useCallback(async () => {
		setLoading(true);
		const all = await listProjects();
		setItems(all);
		setLoading(false);
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const onDelete = async (id: string) => {
		await deleteProject(id);
		await refresh();
	};

	return (
		<Card>
			<CardHeader className="border-b">
				<CardTitle className="text-base">Your reviews</CardTitle>
			</CardHeader>
			<CardContent>
				{loading ? (
					<p className="text-sm text-muted-foreground">Loading…</p>
				) : items.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No reviews yet. Import or create one to get started.
					</p>
				) : (
					<ul className="divide-y">
						{items.map((p) => (
							<li
								key={p.id}
								className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
							>
								<div className="min-w-0 flex-1">
									<div className="text-sm font-medium truncate">
										{p.meta.title}
									</div>
									<div className="text-xs text-muted-foreground">
										{p.meta.sourceLang} → {p.meta.targetLang}
									</div>
									<div className="text-xs text-muted-foreground truncate">
										{p.id}
									</div>
									<div className="text-xs text-muted-foreground">
										Updated {new Date(p.updatedAt).toLocaleString()}
									</div>
								</div>
								<div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
									<Button
										asChild
										variant="outline"
										size="sm"
										className="text-xs"
									>
										<Link href={`/review#${encodeURIComponent(p.id)}`}>
											Open
										</Link>
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => onDelete(p.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
