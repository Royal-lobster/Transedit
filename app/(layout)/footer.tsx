import { ThemeToggle } from "./theme-toggle";

export function Footer() {
	return (
		<footer className="border-t">
			<div className="container mx-auto h-auto py-4 px-4 flex flex-row items-center justify-between text-xs text-muted-foreground">
				<div>
					© {new Date().getFullYear()} TransEdit • Made by{" "}
					<a
						href="https://srujangurram.me"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-primary transition-colors"
					>
						Srujan
					</a>
				</div>
				<ThemeToggle />
			</div>
		</footer>
	);
}
