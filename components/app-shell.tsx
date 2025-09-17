"use client";

import { Edit3, FileDown, Home, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarSeparator,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type AppShellProps = {
	children: React.ReactNode;
	className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
	return (
		<SidebarProvider>
			<Sidebar variant="inset" collapsible="icon">
				<SidebarHeader>
					<div className="flex items-center gap-2 px-2 py-1.5">
						<Sparkles className="h-4 w-4" />
						<span className="font-semibold tracking-tight">TransEdit</span>
					</div>
					<SidebarSeparator />
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>General</SidebarGroupLabel>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild tooltip="Home">
									<Link href="/">
										<Home />
										<span>Home</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild tooltip="Create">
									<Link href="/create">
										<FileDown />
										<span>Create</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild tooltip="Review">
									<Link href="/review">
										<Edit3 />
										<span>Review</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>
					<Separator className="mx-2" />
					<div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center justify-between">
						<span>Theme</span>
						<Badge variant="secondary" className="text-[10px]">
							shadcn
						</Badge>
					</div>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="flex h-14 items-center gap-2 px-4">
						<SidebarTrigger />
						<Separator orientation="vertical" className="mx-2 h-6" />
						<div className="font-medium">TransEdit</div>
					</div>
				</header>
				<div className={cn("px-6 py-6", className)}>{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
