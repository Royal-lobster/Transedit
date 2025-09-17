"use client";

import { Sparkles } from "lucide-react";

export function Navbar() {
	return (
		<header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="h-14 flex items-center justify-center px-4">
				<div className="flex items-center gap-2">
					<div className="size-7 rounded-md bg-primary text-primary-foreground grid place-items-center">
						<Sparkles className="h-4 w-4" />
					</div>
					<div className="font-semibold tracking-tight">Transedit</div>
				</div>
			</div>
		</header>
	);
}
