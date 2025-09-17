import { CreateReviewCard } from "./_components/create-review-card";
import { ReviewTranslationsCard } from "./_components/review-translations-card";
import { ReviewsDashboard } from "./_components/reviews-dashboard";

export default function Home() {
	return (
		<div>
			<section className="mb-6 sm:mb-8">
				<p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
					Upload translation files to generate a portable review file
					(.transedit) or open a review dashboard to edit and export updated
					locale JSON. No server or database required — everything happens
					locally in your browser.
				</p>
			</section>

			<div className="grid gap-6 sm:grid-cols-2">
				<CreateReviewCard />
				<ReviewTranslationsCard />
			</div>

			<div className="mt-8">
				<ReviewsDashboard />
			</div>
		</div>
	);
}
