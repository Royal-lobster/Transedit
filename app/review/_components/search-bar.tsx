"use client";

import { Search } from "lucide-react";
import type { Control } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ReviewFormValues } from "../_hooks/use-review";

export function SearchBar({ control }: { control: Control<ReviewFormValues> }) {
	return (
		<div className="w-full sm:w-80">
			<div className="flex items-center gap-2">
				<Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
				<FormField
					control={control}
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
	);
}
