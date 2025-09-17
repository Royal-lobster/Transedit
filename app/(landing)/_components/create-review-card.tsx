"use client";

import { FileDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function CreateReviewCard() {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-sm sm:text-base">
					<FileDown className="h-4 w-4" /> Create review request
				</CardTitle>
				<CardDescription className="text-xs sm:text-sm">
					Provide en.json and optional locale.json to generate a sharable
					.transedit file for reviewers.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button asChild className="w-full gap-2">
					<Link href="/create">
						<FileDown className="h-4 w-4" />
						Create .transedit
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
