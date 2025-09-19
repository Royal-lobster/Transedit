"use client";

import { Check, Edit, Globe } from "lucide-react";
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
import { Toggle } from "@/components/ui/toggle";
import type { ReviewFormValues } from "../_hooks/use-review";

type TranslationsListProps = {
	keys: string[];
	filteredIndices: number[] | null;
	control: Control<ReviewFormValues>;
	enDict: Record<string, string>;
	isVerified: (index: number) => boolean;
	setVerifiedByIndex: (index: number, value: boolean) => void;
	showTab: "todo" | "verified";
};

export function TranslationsList({
	keys,
	filteredIndices,
	control,
	enDict,
	isVerified,
	setVerifiedByIndex,
	showTab,
}: TranslationsListProps) {
	const showAll = !filteredIndices;
	return (
		<div className="space-y-4">
			{(showAll ? keys.map((_, i) => i) : filteredIndices)
				.filter((i) =>
					showTab === "verified" ? isVerified(i) : !isVerified(i),
				)
				.map((i) => {
					const key = keys[i];
					const en = enDict[key] ?? "";
					return (
						<TranslationCard
							key={key}
							translationKey={key}
							enText={en}
							index={i}
							control={control}
							verified={isVerified(i)}
							onToggleVerified={() => setVerifiedByIndex(i, !isVerified(i))}
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
	verified: boolean;
	onToggleVerified: () => void;
};

function TranslationCard({
	translationKey,
	enText,
	index,
	control,
	verified,
	onToggleVerified,
}: TranslationCardProps) {
	return (
		<Card
			id={`tr-${index}`}
			className="shadow-sm hover:shadow-md transition-shadow"
		>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center justify-between text-sm font-medium">
					<span className="break-words max-w-[60vw] pr-2">
						{translationKey}
					</span>
					<div className="flex items-center gap-2">
						<Toggle
							pressed={verified}
							onPressedChange={onToggleVerified}
							aria-label={verified ? "Unverify" : "Mark as verified"}
							title={verified ? "Unverify" : "Mark as verified"}
							className="text-xs"
						>
							<Check className="w-3 h-3" />
							<span className="hidden sm:inline">Verified</span>
						</Toggle>
						<Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs">
							<Globe className="w-3 h-3 mr-1" />
							Key
						</Badge>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-start space-x-3">
					<Globe className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
					<div className="flex-1 min-w-0">
						<p className="text-xs text-muted-foreground mb-1">English</p>
						<p className="text-sm text-foreground break-words">{enText}</p>
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
									className="min-h-[100px] resize-none text-base leading-relaxed"
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
