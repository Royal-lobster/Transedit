"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { range } from "@/lib/helpers/range";

export function ReviewSkeleton() {
	return (
		<div className="space-y-6">
			<div
				id="review-topbar"
				className="sticky -mt-20 mb-20 top-14 z-20 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
			>
				<div className="py-3 flex flex-row items-center justify-between gap-3">
					<div className="h-9 w-full max-w-md animate-pulse rounded-md bg-muted/60" />
					<div className="h-9 w-44 animate-pulse rounded-md bg-muted/60" />
				</div>
			</div>

			<div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px]">
				<Card className="overflow-visible bg-transparent border-none shadow-none">
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<div className="h-5 w-28 animate-pulse rounded bg-muted/60" />
							<div className="h-5 w-20 animate-pulse rounded bg-muted/60" />
						</div>
					</CardHeader>
					<CardContent className="p-0 space-y-3">
						{range(6).map((n) => (
							<div
								key={`tr-${n}`}
								className="flex flex-col gap-2 rounded-md border p-3"
							>
								<div className="h-4 w-1/2 animate-pulse rounded bg-muted/60" />
								<div className="h-6 w-full animate-pulse rounded bg-muted/50" />
							</div>
						))}
						<p className="mt-4 text-xs text-muted-foreground">Loading…</p>
					</CardContent>
				</Card>

				<div className="space-y-4 lg:sticky lg:top-36 lg:self-start order-first lg:order-last">
					<div className="rounded-lg border p-4">
						<div className="h-5 w-40 animate-pulse rounded bg-muted/60" />
						<div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted/50" />
						<div className="mt-4 h-2 w-full animate-pulse rounded bg-muted/40" />
					</div>
					<div className="rounded-lg border p-4 space-y-2">
						{range(8).map((n) => (
							<div
								key={`node-${n}`}
								className="h-4 w-full animate-pulse rounded bg-muted/50"
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
