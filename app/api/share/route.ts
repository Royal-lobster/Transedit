import { Readable } from "node:stream";
import type { NextRequest } from "next/server";
import { Catbox } from "node-catbox";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
	try {
		const contentType = req.headers.get("content-type") || "";
		if (!contentType.includes("application/json")) {
			return new Response(
				JSON.stringify({ error: "Expected application/json" }),
				{ status: 400, headers: { "content-type": "application/json" } },
			);
		}
		const body = await req.json();
		// Accept either raw TransEdit JSON (object) or { json: string }
		const jsonString =
			typeof body === "string"
				? body
				: typeof body?.json === "string"
					? body.json
					: JSON.stringify(body);
		const buffer = Buffer.from(jsonString, "utf8");

		// Use SDK for typed responses
		const catbox = new Catbox(process.env.CATBOX_USER_HASH);
		const stream = Readable.from(buffer);
		const url = await catbox.uploadFileStream({
			stream,
			filename: "review.transedit",
		});
		const id = url.split("/").pop() || url;
		return new Response(JSON.stringify({ id, url }), {
			status: 200,
			headers: { "content-type": "application/json" },
		});
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return new Response(JSON.stringify({ error: msg }), {
			status: 500,
			headers: { "content-type": "application/json" },
		});
	}
}
