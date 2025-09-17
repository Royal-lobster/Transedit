"use client";

import type { TooltipContentProps } from "@radix-ui/react-tooltip";
import type { ReactElement } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
	children: ReactElement;
	message?: string;
} & TooltipContentProps;

export default function ShareDisclaimer({
	children,
	message = "Creating a share link uploads the .transedit file to catbox.moe for temporary hosting.",
	...rest
}: Props) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent {...rest}>{message}</TooltipContent>
		</Tooltip>
	);
}
