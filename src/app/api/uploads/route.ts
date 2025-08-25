import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import probe from "probe-image-size";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
const infoDir = path.join(process.cwd(), "public", "image_info");

const imageContentsPrompt = `
Describe the image's composition and layout using factual, non-decorative language.

Structure your description as follows:
1. State the overall format (e.g., "Single photograph", "Split layout with photo and text panel", "Grid of items", "Text overlay on image")
2. List each distinct zone/section with its position (left, right, top, bottom, center, quadrant)
3. For each zone, identify what it contains:
   - Photography: State subject matter only (e.g., "green cake", "group of people", "boats")
   - Text elements: Note presence and hierarchy (e.g., "heading text", "body copy", "button labeled X")
   - Graphics: Logos, badges, icons, borders
   - Colors: Mention if they define zones (e.g., "[COLOR] background panel") or typograpy ("[COLOR] text with [COLOR] shadow")

Use simple nouns without adjectives. Focus on spatial relationships.
Example: "Split layout. Left half: photograph of fishing boats. Right half: white panel with heading text at top, paragraph text in middle, orange button at bottom."

Do NOT use descriptive adjectives like beautiful, vibrant, elegant, stunning, etc.`

async function ensureUploadsDir() {
	try {
		await fs.mkdir(uploadsDir, { recursive: true });
		await fs.mkdir(infoDir, { recursive: true });
	} catch {}
}

function getExtensionFromFilenameOrType(name?: string | null, type?: string | null) {
	if (name) {
		const ext = path.extname(name);
		if (ext) return ext;
	}
	if (type) {
		const mapping: Record<string, string> = {
			"image/jpeg": ".jpg",
			"image/png": ".png",
			"image/gif": ".gif",
			"image/webp": ".webp",
			"image/svg+xml": ".svg",
		};
		if (mapping[type]) return mapping[type];
	}
	return "";
}

function isImageFile(filename: string) {
	return /(\.jpg|\.jpeg|\.png|\.gif|\.webp|\.svg)$/i.test(filename);
}

export async function GET() {
	await ensureUploadsDir();
	const entries = await fs.readdir(uploadsDir).catch(() => [] as string[]);
	const files = entries.filter((name) => isImageFile(name));
	// Also report which images already have metadata generated
	let infoIds: string[] = [];
	try {
		const infos = await fs.readdir(infoDir);
		infoIds = infos.filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/,''));
	} catch {}
	return NextResponse.json({ files, infoIds });
}

export async function POST(req: NextRequest) {
	await ensureUploadsDir();
	const formData = await req.formData();
	const saved: string[] = [];

	for (const [key, value] of formData.entries()) {
		if (key !== "file") continue;
		if (!(value instanceof File)) continue;
		const arrayBuffer = await value.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const ext = getExtensionFromFilenameOrType(value.name, value.type);
		const id = randomUUID();
		const filename = `${id}${ext}`;
		const filePath = path.join(uploadsDir, filename);
		await fs.writeFile(filePath, buffer);
		saved.push(filename);

		// Kick off metadata generation in the background
		(async () => {
			// Extract width/height using probe-image-size
			let width: number | undefined;
			let height: number | undefined;
			try {
				const syncFn = (probe as any).sync as ((input: any) => { width?: number; height?: number } | undefined) | undefined;
				const p = syncFn ? syncFn(buffer) : undefined;
				if (p && p.width && p.height) { width = p.width; height = p.height; }
			} catch {}

			try {
				const base64 = `data:${value.type || 'image/*'};base64,${buffer.toString('base64')}`;
				const extractSchema = z.object({
					image_contents: z.string().min(1).max(300).describe(imageContentsPrompt),
					overlay_text: z.string().max(2000).describe("Quote any visible text overlaid on the image."),
					image_good_for: z.array(z.enum(["banner","hero image","product photography","lifestyle photography","background","section heading","other"])).min(1).max(2).describe("A list of tags that describe the image's purpose."),
					suggested_alt_text: z.string().min(3).max(200).describe("Concise single-sentence alt text."),
				});
				const analysis = await generateObject({
					model: openai('gpt-5-mini'),
					schema: extractSchema,
					messages: [
						{
							role: 'user',
							content: [
								{ type: 'text', text: 'Analyze this image for use in marketing emails. Describe contents in one sentence, extract visible overlay text, suggest 1-2 tags from the set {banner, product photography, lifestyle photography, background, section heading, other}, and propose concise alt text.' },
								{ type: 'image', image: base64 },
							],
						},
					],
				});
				const obj = analysis.object as any;
				const json = {
					id: id,
					filename,
					width,
					height,
					image_contents: obj?.image_contents,
					text: obj?.text,
					image_good_for: obj?.image_good_for,
					suggested_alt_text: obj?.suggested_alt_text,
				};
				await fs.writeFile(path.join(infoDir, `${id}.json`), JSON.stringify(json, null, 2), 'utf8');
			} catch (err) {
				// If analysis fails, still save basic info
				const fallback = { id, filename, width, height };
				await fs.writeFile(path.join(infoDir, `${id}.json`), JSON.stringify(fallback, null, 2), 'utf8');
			}
		})().catch(() => {});
	}

	return NextResponse.json({ saved });
}

export async function DELETE(req: NextRequest) {
	await ensureUploadsDir();
	const { searchParams } = new URL(req.url);
	const name = searchParams.get("file");
	if (!name) {
		return new NextResponse("Missing 'file' query param", { status: 400 });
	}
	// Allow only uuid-like filenames with optional extension
	if (!/^[a-f0-9\-]+\.[A-Za-z0-9]+$/.test(name)) {
		return new NextResponse("Invalid filename", { status: 400 });
	}
	const filePath = path.join(uploadsDir, name);
	try {
		await fs.unlink(filePath);
		// Best-effort: also remove corresponding image_info JSON
		try {
			const idOnly = name.split(".")[0];
			const infoPath = path.join(infoDir, `${idOnly}.json`);
			await fs.unlink(infoPath).catch(() => {});
		} catch {}
		return new NextResponse(null, { status: 204 });
	} catch (err) {
		return new NextResponse("Not found", { status: 404 });
	}
}
