import { promises as fs } from "fs";
import path from "path";

export type ImageInfo = {
  id: string;
  filename: string;
  width?: number;
  height?: number;
  image_contents?: string;
  overlay_text?: string;
  image_good_for?: ("banner" | "hero image" | "product photography" | "lifestyle photography" | "background" | "section heading" | "other")[];
  suggested_alt_text?: string;
};

const infoDir = path.join(process.cwd(), "public", "image_info");

export async function readAllImageInfo(): Promise<ImageInfo[]> {
  try {
    await fs.mkdir(infoDir, { recursive: true });
  } catch {}
  const entries = await fs.readdir(infoDir).catch(() => [] as string[]);
  const jsonFiles = entries.filter((f) => f.endsWith('.json'));
  const results: ImageInfo[] = [];
  await Promise.all(
    jsonFiles.map(async (file) => {
      try {
        const body = await fs.readFile(path.join(infoDir, file), 'utf8');
        const parsed = JSON.parse(body);
        results.push(parsed as ImageInfo);
      } catch {}
    })
  );
  return results;
}

export function formatImageInfoForSystemPrompt(infos: ImageInfo[]): string {
  if (!infos.length) return "No uploaded images yet.";
  const parts = infos.map((i) => {
    const attributes = Object.entries(i)
      .map(([key, value]) => {
        let formatted: string;
        if (value === undefined || value === null) {
          formatted = "n/a";
        } else if (Array.isArray(value)) {
          formatted = value.join(", ");
        } else if (typeof value === "object") {
          try {
            formatted = JSON.stringify(value as unknown);
          } catch {
            formatted = String(value);
          }
        } else {
          formatted = String(value);
        }
        return `${key}: ${formatted}`;
      });

    return `- ${attributes.join(", ")}`;
  });
  return `Available uploaded images (use filename to reference images):\n${parts.join('\n')}`;
}




