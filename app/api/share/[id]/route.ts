import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(
	_req: NextRequest,
	ctx: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await ctx.params;
		if (!id) {
			return new Response(JSON.stringify({ error: "Missing id" }), {
				status: 400,
				headers: { "content-type": "application/json" },
			});
		}
		const url = `https://files.catbox.moe/${encodeURIComponent(id)}`;
		const resp = await fetch(url);
		if (!resp.ok) {
			return new Response(
				JSON.stringify({ error: `Fetch failed: ${resp.status}` }),
				{ status: 502, headers: { "content-type": "application/json" } },
			);
		}
		const text = await resp.text();
		// Return raw text so client can parse/validate
		return new Response(text, {
			status: 200,
			headers: { "content-type": "application/json; charset=utf-8" },
		});
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return new Response(JSON.stringify({ error: msg }), {
			status: 500,
			headers: { "content-type": "application/json" },
		});
	}
}
