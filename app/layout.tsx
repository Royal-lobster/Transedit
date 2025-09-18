import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/app/(layout)/footer";
import { Navbar } from "@/app/(layout)/navbar";
import { QueryProvider } from "@/app/(layout)/query-provider";
import { ThemeProvider } from "@/app/(layout)/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "TransEdit — Translation review",
	description:
		"Local-first translation review and editing tool. Upload .transedit files, review and export locale JSON, and share reviews via short links.",
	icons: {
		icon: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider>
					<QueryProvider>
						<div className="min-h-[calc(100vh-100px)] flex flex-col">
							<Navbar />
							<main className="flex-1 container max-w-5xl py-8 px-4 mx-auto">
								{children}
							</main>
						</div>
						<Footer />
						<Toaster richColors position="bottom-center" />
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
