import { Sparkles } from "lucide-react";
import { ReviewClient } from "./_components/review-client";

export default function ReviewPage() {
	return (
		<div className="min-h-screen w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
			<div className="mx-auto max-w-6xl px-6 py-10">
				<div className="mb-8 flex items-center gap-3">
					<Sparkles className="h-6 w-6 text-sky-400" />
					<h1 className="text-2xl font-semibold tracking-tight">
						Review Translations
					</h1>
				</div>
				<ReviewClient />
			</div>
		</div>
	);
}
