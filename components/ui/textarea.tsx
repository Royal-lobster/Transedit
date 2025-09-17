"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, rows = 3, ...props }, ref) => {
		return (
			<textarea
				ref={ref}
				rows={rows}
				className={cn(
					"flex w-full rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-2",
					"text-sm text-zinc-100 placeholder:text-zinc-500",
					"outline-none ring-fuchsia-500/30 focus:ring-2",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"resize-y",
					className,
				)}
				{...props}
			/>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea };
