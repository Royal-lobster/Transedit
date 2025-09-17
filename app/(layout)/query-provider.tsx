"use client";

import {
	QueryClient,
	QueryClientProvider,
	useIsFetching,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";
import { useState } from "react";

export function QueryProvider({ children }: PropsWithChildren) {
	const [client] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						retry: 1,
						refetchOnWindowFocus: false,
						staleTime: 30_000,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={client}>
			<GlobalFetchingBar />
			{children}
			<ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
		</QueryClientProvider>
	);
}

function GlobalFetchingBar() {
	const fetching = useIsFetching();
	if (!fetching) return null;
	return (
		<div className="fixed left-0 right-0 top-0 z-50 h-0.5">
			<div className="h-full w-full animate-[indeterminate_1.2s_ease_infinite] bg-gradient-to-r from-primary via-primary/30 to-transparent" />
			<style jsx>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(-20%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
		</div>
	);
}
