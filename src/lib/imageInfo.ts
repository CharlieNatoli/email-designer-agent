import { promises as fs } from "fs";
import path from "path";

export type ImageInfo = {
  id: string;
  filename: string;
  width?: number;
  height?: number;
  image_contents?: string;
  text?: string;
  image_good_for?: ("banner" | "product photography" | "lifestyle photography" | "background" | "section heading" | "other")[];
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
    const tags = i.image_good_for && i.image_good_for.length ? `tags: ${i.image_good_for.join(', ')}` : "tags: none";
    const dims = i.width && i.height ? `${i.width}x${i.height}` : "unknown size";
    return `- id: ${i.id}, file: ${i.filename}, size: ${dims}, contents: ${i.image_contents ?? 'n/a'}, text: ${i.text ?? 'n/a'}, ${tags}, suggested_alt_text: ${i.suggested_alt_text ?? 'n/a'}`;
  });
  return `Available uploaded images (use ids to reference images):\n${parts.join('\n')}`;
}




