import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

async function ensureUploadsDir() {
	try {
		await fs.mkdir(uploadsDir, { recursive: true });
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
	return NextResponse.json({ files });
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
		return new NextResponse(null, { status: 204 });
	} catch (err) {
		return new NextResponse("Not found", { status: 404 });
	}
}
