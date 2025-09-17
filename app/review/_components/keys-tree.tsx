"use client";

import { ChevronDown, ChevronRight, Dot } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type KeysTreeProps = {
	keys: string[];
	onSelect?: (key: string) => void;
	className?: string;
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

export function KeysTree({ keys, onSelect, className }: KeysTreeProps) {
	const tree = useMemo(() => buildTree(keys), [keys]);
	return (
		<Card className="pb-0 gap-0">
			<CardHeader className="border-b">
				<CardTitle className="text-base">Keys</CardTitle>
			</CardHeader>
			<CardContent className="!p-0">
				<div className={cn("text-sm leading-tight", className)}>
					<ScrollArea className="h-[300px] p-2 sm:h-[400px] lg:h-[calc(100vh-424px)]">
						{Object.values(tree).map((n) => (
							<TreeNode key={n.path} node={n} depth={0} onSelect={onSelect} />
						))}
					</ScrollArea>
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
