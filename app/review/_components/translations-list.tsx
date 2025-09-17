"use client";

import type { Control } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewFormValues } from "../_hooks/use-review";

type TranslationsListProps = {
	keys: string[];
	filteredIndices: number[] | null;
	control: Control<ReviewFormValues>;
	enDict: Record<string, string>;
};

export function TranslationsList({
	keys,
	filteredIndices,
	control,
	enDict,
}: TranslationsListProps) {
	const showAll = !filteredIndices;
	return (
		<div className="space-y-6">
			{(showAll ? keys.map((_, i) => i) : filteredIndices).map((i) => {
				const key = keys[i];
				const en = enDict[key] ?? "";
				return (
					<div key={key} className="rounded-md border p-4">
						<div className="mb-2 text-sm text-zinc-500">{key}</div>
						<div className="mb-3 text-sm text-zinc-700">EN: {en}</div>
						<FormField
							control={control}
							name={`translations.${i}` as const}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="sr-only">{key}</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter translation"
											value={(field.value as string) ?? ""}
											onChange={field.onChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				);
			})}
		</div>
	);
}
