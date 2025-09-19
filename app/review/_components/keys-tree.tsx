"use client";

import { ChevronDown, ChevronRight, Dot } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type KeysTreeProps = {
	keys: string[];
	className?: string;
	onSelect?: (key: string) => void;
};

// Build a simple dot-delimited tree structure
type Node = {
	name: string;
	path: string;
	children: Record<string, Node>;
	isLeaf: boolean;
};
function buildTree(keys: string[]) {
	const root: Node = { name: "", path: "", children: {}, isLeaf: false };
	for (const k of keys) {
		const parts = k.split(".");
		let node = root;
		let pathAcc = "";
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (!part) continue;
			pathAcc = pathAcc ? `${pathAcc}.${part}` : part;
			if (!node.children[part]) {
				node.children[part] = {
					name: part,
					path: pathAcc,
					children: {},
					isLeaf: i === parts.length - 1,
				};
			} else if (i === parts.length - 1) {
				node.children[part].isLeaf = true;
			}
			node = node.children[part];
		}
	}
	return root.children;
}

export function KeysTree({ keys, className, onSelect }: KeysTreeProps) {
	const tree = useMemo(() => buildTree(keys), [keys]);

	// Default scrolling behavior if no onSelect is provided
	function scrollToKey(key: string) {
		const idx = keys.indexOf(key);
		if (idx < 0) return;
		const el = document.getElementById(`tr-${idx}`);
		if (!el) return;
		const viewport = el.closest(
			'[data-slot="scroll-area-viewport"]',
		) as HTMLElement | null;
		if (viewport) {
			const targetTop = el.getBoundingClientRect().top;
			const vpTop = viewport.getBoundingClientRect().top;
			const offset = targetTop - vpTop + viewport.scrollTop - 8;
			viewport.scrollTo({ top: offset, behavior: "smooth" });
			return;
		}
		const appHeader = document.querySelector(
			"header.sticky",
		) as HTMLElement | null;
		const topBar = document.getElementById("review-topbar");
		const stickyOffset =
			(appHeader?.offsetHeight ?? 0) + (topBar?.offsetHeight ?? 0) + 8;
		const y = el.getBoundingClientRect().top + window.scrollY - stickyOffset;
		window.scrollTo({ top: y, behavior: "smooth" });
	}

	const handleSelect = onSelect ?? scrollToKey;

	return (
		<Card className="pb-0 gap-0">
			<CardHeader className="border-b">
				<CardTitle className="text-base">Keys</CardTitle>
			</CardHeader>
			<CardContent className="!p-0">
				<div className={cn("text-sm leading-tight", className)}>
					{keys.length === 0 ? (
						<div className="p-6 text-center text-muted-foreground text-xs">
							No keys in this view.
						</div>
					) : (
						<ScrollArea className="h-[300px] p-2 sm:h-[400px] lg:h-[calc(100vh-424px)]">
							{Object.values(tree).map((n) => (
								<TreeNode
									key={n.path}
									node={n}
									depth={0}
									onSelect={handleSelect}
								/>
							))}
						</ScrollArea>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function TreeNode({
	node,
	depth,
	onSelect,
}: {
	node: Node;
	depth: number;
	onSelect?: (key: string) => void;
}) {
	const [open, setOpen] = useState(depth < 1); // expand first level by default
	const hasChildren = Object.keys(node.children).length > 0;
	const isLeaf = node.isLeaf && !hasChildren;
	const padding = 8 + depth * 14;

	return (
		<div className="select-none">
			<button
				type="button"
				className={cn(
					"flex w-full items-center gap-1.5 py-1 px-2 rounded-md hover:bg-muted text-left min-h-8 touch-manipulation",
					isLeaf && "text-foreground",
				)}
				style={{ paddingLeft: padding }}
				onClick={() => {
					if (isLeaf) onSelect?.(node.path);
					else setOpen((o) => !o);
				}}
			>
				<span className="inline-flex size-5 items-center justify-center text-muted-foreground">
					{hasChildren ? (
						open ? (
							<ChevronDown className="size-4" />
						) : (
							<ChevronRight className="size-4" />
						)
					) : (
						<Dot className="size-4" />
					)}
				</span>
				<span className={cn(isLeaf ? "font-normal" : "font-medium")}>
					{node.name}
				</span>
			</button>
			{hasChildren && open && (
				<div>
					{Object.values(node.children)
						.sort(
							(a, b) =>
								Number(Object.keys(b.children).length > 0) -
									Number(Object.keys(a.children).length > 0) ||
								a.name.localeCompare(b.name),
						)
						.map((child) => (
							<TreeNode
								key={child.path}
								node={child}
								depth={depth + 1}
								onSelect={onSelect}
							/>
						))}
				</div>
			)}
		</div>
	);
}
