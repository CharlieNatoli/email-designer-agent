// EmailComponents.ts
import { z } from "zod";

// Shared types
export type EmailComponentType =
  | "section"
  | "column"
  | "text"
  | "divider"
  | "spacer"
  | "button"
  | "image";

export abstract class BaseEmailComponent<TAttributes extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  type: EmailComponentType;
  attributes: TAttributes;

  constructor(id: string, type: EmailComponentType, attributes: TAttributes) {
    this.id = id;
    this.type = type;
    this.attributes = attributes;
  }

  // Render MJML string for this component. Implement in subclasses.
  abstract renderMJML(context?: RenderContext): string;
}

// Attribute Schemas
export const textAttributesSchema = z.object({
  content: z.string(),
  color: z.string().optional().default("#111111"),
  fontSize: z.string().optional().default("16px"),
  fontFamily: z.string().optional().default("Helvetica, Arial, sans-serif"),
  lineHeight: z.string().optional().default("1.6"),
  padding: z.string().optional().default("0px")
});

export const dividerAttributesSchema = z.object({
  borderColor: z.string().optional().default("#E5E7EB"),
  borderWidth: z.string().optional().default("1px"),
  padding: z.string().optional().default("16px 0")
});

export const spacerAttributesSchema = z.object({
  height: z.string().optional().default("16px")
});

export const buttonAttributesSchema = z.object({
  href: z.string().url(),
  text: z.string(),
  backgroundColor: z.string().optional().default("#111827"),
  color: z.string().optional().default("#FFFFFF"),
  fontSize: z.string().optional().default("16px"),
  fontFamily: z.string().optional().default("Helvetica, Arial, sans-serif"),
  innerPadding: z.string().optional().default("12px 18px"),
  borderRadius: z.string().optional().default("6px"),
  align: z.enum(["left", "center", "right"]).optional().default("left"),
  padding: z.string().optional().default("0px")
});

export const imageAttributesSchema = z.object({
  // Use the uploaded image's id (UUID without extension)
  imageId: z.string().describe("Use the uploaded image's id (UUID without extension)"),
  alt: z.string().optional(),
  width: z.string().optional(),
  padding: z.string().optional().default("0px")
});

export const columnAttributesSchema = z.object({
  width: z.number().int().min(0).max(100).default(100),
  padding: z.string().optional().default("0px")
});

export const sectionAttributesSchema = z.object({
  backgroundColor: z.string().optional().default("#FFFFFF"),
  padding: z.string().optional().default("24px 16px"),
  fullWidth: z.boolean().optional().default(false)
});

// Optional render-time context passed down into components
export type RenderContext = {
  imageIdToAlt?: Record<string, string | undefined>;
};

// Recursive schema for the component tree
// We create placeholders first and fill them with z.lazy
export type AnyComponentNode = z.infer<typeof componentSchema>;

export const textNodeSchema = z.object({
  id: z.string(),
  type: z.literal("text"),
  attributes: textAttributesSchema
});

export const dividerNodeSchema = z.object({
  id: z.string(),
  type: z.literal("divider"),
  attributes: dividerAttributesSchema
});

export const spacerNodeSchema = z.object({
  id: z.string(),
  type: z.literal("spacer"),
  attributes: spacerAttributesSchema
});

export const buttonNodeSchema = z.object({
  id: z.string(),
  type: z.literal("button"),
  attributes: buttonAttributesSchema
});

export const imageNodeSchema = z.object({
  id: z.string(),
  type: z.literal("image"),
  attributes: imageAttributesSchema
});

export const leafComponentSchema = z.discriminatedUnion("type", [
  textNodeSchema,
  dividerNodeSchema,
  spacerNodeSchema,
  buttonNodeSchema,
  imageNodeSchema
]);

export type LeafComponentNode = z.infer<typeof leafComponentSchema>;

export const columnNodeSchema = z.object({
  id: z.string(),
  type: z.literal("column"),
  attributes: columnAttributesSchema,
  children: z.array(leafComponentSchema)
});

export const sectionNodeSchema = z.object({
  id: z.string(),
  type: z.literal("section"),
  attributes: sectionAttributesSchema,
  children: z.array(columnNodeSchema).min(1)
});

export const componentSchema = z.discriminatedUnion("type", [
  sectionNodeSchema,
  columnNodeSchema,
  ...leafComponentSchema.options
]);

export type EmailTree = z.infer<typeof sectionNodeSchema> | z.infer<typeof columnNodeSchema>;

// Concrete classes
export class SectionComponent extends BaseEmailComponent<z.infer<typeof sectionAttributesSchema>> {
  children: ColumnComponent[];
  constructor(node: z.infer<typeof sectionNodeSchema>) {
    super(node.id, "section", node.attributes);
    this.children = node.children.map((c: z.infer<typeof columnNodeSchema>) => new ColumnComponent(c));
  }
  renderMJML(context?: RenderContext): string {
    const childrenMJML = this.children.map((c) => c.renderMJML(context)).join("");
    const { backgroundColor, padding, fullWidth } = this.attributes;
    const attrs = [
      backgroundColor ? `background-color=\"${backgroundColor}\"` : "",
      padding ? `padding=\"${padding}\"` : "",
      fullWidth ? `full-width=\"${fullWidth}\"` : ""
    ].filter(Boolean).join(" ");
    return `<mj-section ${attrs}>${childrenMJML}</mj-section>`;
  }
}

export class ColumnComponent extends BaseEmailComponent<z.infer<typeof columnAttributesSchema>> {
  children: Array<TextComponent | DividerComponent | SpacerComponent | ButtonComponent | ImageComponent>;
  constructor(node: z.infer<typeof columnNodeSchema>) {
    super(node.id, "column", node.attributes);
    this.children = node.children.map((child: LeafComponentNode) => createLeafInstance(child));
  }
  renderMJML(context?: RenderContext): string {
    const childrenMJML = this.children.map((c) => c.renderMJML(context)).join("");
    const { width, padding } = this.attributes;
    const attrs = [`width=\"${width}%\"`, padding ? `padding=\"${padding}\"` : ""].filter(Boolean).join(" ");
    return `<mj-column ${attrs}>${childrenMJML}</mj-column>`;
  }
}

function createLeafInstance(node: LeafComponentNode): TextComponent | DividerComponent | SpacerComponent | ButtonComponent | ImageComponent {
  switch (node.type) {
    case "text":
      return new TextComponent(node);
    case "divider":
      return new DividerComponent(node);
    case "spacer":
      return new SpacerComponent(node);
    case "button":
      return new ButtonComponent(node);
    case "image":
      return new ImageComponent(node);
  }
}

export class TextComponent extends BaseEmailComponent<z.infer<typeof textAttributesSchema>> {
  constructor(node: z.infer<typeof textNodeSchema>) {
    super(node.id, "text", node.attributes);
  }
  renderMJML(_context?: RenderContext): string {
    const { content, color, fontSize, fontFamily, lineHeight, padding } = this.attributes;
    const attrs = [
      color ? `color=\"${color}\"` : "",
      fontSize ? `font-size=\"${fontSize}\"` : "",
      fontFamily ? `font-family=\"${fontFamily}\"` : "",
      lineHeight ? `line-height=\"${lineHeight}\"` : "",
      padding ? `padding=\"${padding}\"` : ""
    ].filter(Boolean).join(" ");
    return `<mj-text ${attrs}>${escapeHtml(content)}</mj-text>`;
  }
}

export class DividerComponent extends BaseEmailComponent<z.infer<typeof dividerAttributesSchema>> {
  constructor(node: z.infer<typeof dividerNodeSchema>) {
    super(node.id, "divider", node.attributes);
  }
  renderMJML(_context?: RenderContext): string {
    const { borderColor, borderWidth, padding } = this.attributes;
    const attrs = [
      borderColor ? `border-color=\"${borderColor}\"` : "",
      borderWidth ? `border-width=\"${borderWidth}\"` : "",
      padding ? `padding=\"${padding}\"` : ""
    ].filter(Boolean).join(" ");
    return `<mj-divider ${attrs} />`;
  }
}

export class SpacerComponent extends BaseEmailComponent<z.infer<typeof spacerAttributesSchema>> {
  constructor(node: z.infer<typeof spacerNodeSchema>) {
    super(node.id, "spacer", node.attributes);
  }
  renderMJML(): string {
    const { height } = this.attributes;
    const attrs = [height ? `height=\"${height}\"` : ""].filter(Boolean).join(" ");
    return `<mj-spacer ${attrs} />`;
  }
}

export class ButtonComponent extends BaseEmailComponent<z.infer<typeof buttonAttributesSchema>> {
  constructor(node: z.infer<typeof buttonNodeSchema>) {
    super(node.id, "button", node.attributes);
  }
  renderMJML(): string {
    const { href, text, backgroundColor, color, fontSize, fontFamily, innerPadding, borderRadius, align, padding } = this.attributes;
    const attrs = [
      href ? `href=\"${href}\"` : "",
      backgroundColor ? `background-color=\"${backgroundColor}\"` : "",
      color ? `color=\"${color}\"` : "",
      fontSize ? `font-size=\"${fontSize}\"` : "",
      fontFamily ? `font-family=\"${fontFamily}\"` : "",
      innerPadding ? `inner-padding=\"${innerPadding}\"` : "",
      borderRadius ? `border-radius=\"${borderRadius}\"` : "",
      align ? `align=\"${align}\"` : "",
      padding ? `padding=\"${padding}\"` : ""
    ].filter(Boolean).join(" ");
    return `<mj-button ${attrs}>${escapeHtml(text)}</mj-button>`;
  }
}

export class ImageComponent extends BaseEmailComponent<z.infer<typeof imageAttributesSchema>> {
  constructor(node: z.infer<typeof imageNodeSchema>) {
    super(node.id, "image", node.attributes);
  }
  renderMJML(): string {
    const { imageId, alt, width, padding } = this.attributes;
    const src = `/uploads/${imageId}.jpg`;
    const attrs = [
      imageId ? `src="${src}"` : "",
      alt ? `alt="${escapeHtml(alt)}"` : "",
      width ? `width="${width}"` : "",
      padding ? `padding="${padding}"` : ""
    ].filter(Boolean).join(" ");
    return `<mj-image ${attrs} />`;
  }
}

// TODO - is this needed?
export function renderTreeToMJML(node: z.infer<typeof sectionNodeSchema> | z.infer<typeof columnNodeSchema> | LeafComponentNode): string {
  switch (node.type) {
    case "section":
      return new SectionComponent(node as z.infer<typeof sectionNodeSchema>).renderMJML();
    case "column":
      return new ColumnComponent(node as z.infer<typeof columnNodeSchema>).renderMJML();
    case "text":
      return new TextComponent(node as z.infer<typeof textNodeSchema>).renderMJML();
    case "divider":
      return new DividerComponent(node as z.infer<typeof dividerNodeSchema>).renderMJML();
    case "spacer":
      return new SpacerComponent(node as z.infer<typeof spacerNodeSchema>).renderMJML();
    case "button":
      return new ButtonComponent(node as z.infer<typeof buttonNodeSchema>).renderMJML();
    case "image":
      return new ImageComponent(node as z.infer<typeof imageNodeSchema>).renderMJML();
  }
}

export function renderEmailDocumentMJML(sections: Array<z.infer<typeof sectionNodeSchema>>): string {
  const bodyContent = sections.map((s) => new SectionComponent(s).renderMJML()).join("");
  return `<mjml><mj-body background-color=\"#F8FAFC\">${bodyContent}</mj-body></mjml>`;
}

export const emailDraftSchema = z.object({
  sections: z.array(sectionNodeSchema).min(1)
});

export type EmailDraft = z.infer<typeof emailDraftSchema>;

export function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function validateColumnWidths(columns: z.infer<typeof columnNodeSchema>[]): void {
  const total = columns.reduce((acc, c) => acc + (c.attributes.width ?? 0), 0);
  if (columns.length === 1) return; // allow 100 by default
  if (total !== 100) {
    throw new Error(`Column widths must add up to 100. Received total=${total}`);
  }
}

export const DraftToolInputSchema = z.object({
  brief: z.string().describe("repeat the description of the email from the customer in the chat so far. "),
});

export type DraftToolInput = z.infer<typeof DraftToolInputSchema>;
