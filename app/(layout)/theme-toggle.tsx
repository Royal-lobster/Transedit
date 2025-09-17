"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const themes = [
	{
		value: "light",
		label: "Light",
		icon: <Sun className="h-4 w-4" />,
	},
	{
		value: "system",
		label: "System",
		icon: <Monitor className="h-4 w-4" />,
	},
	{
		value: "dark",
		label: "Dark",
		icon: <Moon className="h-4 w-4" />,
	},
];

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="flex gap-2">
			{themes.map(({ value, label, icon }) => (
				<Tooltip key={value}>
					<TooltipTrigger asChild>
						<Button
							variant={theme === value ? "secondary" : "ghost"}
							size="icon"
							aria-label={`Set ${label} theme`}
							onClick={() => setTheme(value)}
						>
							{icon}
						</Button>
					</TooltipTrigger>
					<TooltipContent>{label} theme</TooltipContent>
				</Tooltip>
			))}
		</div>
	);
}
