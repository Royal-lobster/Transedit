"use client";

import { Edit, Globe } from "lucide-react";
import type { Control } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
		<div className="space-y-4">
			{(showAll ? keys.map((_, i) => i) : filteredIndices).map((i) => {
				const key = keys[i];
				const en = enDict[key] ?? "";
				return (
					<TranslationCard
						key={key}
						translationKey={key}
						enText={en}
						index={i}
						control={control}
					/>
				);
			})}
		</div>
	);
}

type TranslationCardProps = {
	translationKey: string;
	enText: string;
	index: number;
	control: Control<ReviewFormValues>;
};

function TranslationCard({
	translationKey,
	enText,
	index,
	control,
}: TranslationCardProps) {
	return (
		<Card className="shadow-sm hover:shadow-md transition-shadow">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center justify-between text-sm font-medium">
					<span className="truncate">{translationKey}</span>
					<Badge variant="secondary" className="ml-2 flex-shrink-0">
						<Globe className="w-3 h-3 mr-1" />
						Key
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-start space-x-2">
					<Globe className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
					<div className="flex-1">
						<p className="text-xs text-muted-foreground mb-1">English</p>
						<p className="text-sm text-foreground">{enText}</p>
					</div>
				</div>
				<FormField
					control={control}
					name={`translations.${index}` as const}
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center text-xs text-muted-foreground mb-2">
								<Edit className="w-3 h-3 mr-1" />
								Translation
							</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Enter translation..."
									className="min-h-[80px] resize-none"
									value={(field.value as string) ?? ""}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	);
}
