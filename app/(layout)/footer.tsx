import { ThemeToggle } from "./theme-toggle";

export function Footer() {
	return (
		<footer className="border-t container mx-auto h-auto py-4 px-4 flex flex-row items-center justify-between text-xs text-muted-foreground">
			<div>© {new Date().getFullYear()} TransEdit • Made by Srujan</div>
			<ThemeToggle />
		</footer>
	);
}
