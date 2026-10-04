export type BlockKind = "heading" | "paragraph" | "columns" | "table" | "divider" | "spacer" | "image";

export const blockPalette: { kind: BlockKind; label: string; description: string; symbol: string }[] = [
  { kind: "heading", label: "Judul", description: "Judul bagian", symbol: "H" },
  { kind: "paragraph", label: "Paragraf", description: "Teks isi dokumen", symbol: "¶" },
  { kind: "columns", label: "Dua kolom", description: "Konten berdampingan", symbol: "▥" },
  { kind: "table", label: "Tabel", description: "Data berbentuk baris", symbol: "▦" },
  { kind: "divider", label: "Garis", description: "Pemisah bagian", symbol: "—" },
  { kind: "spacer", label: "Spasi", description: "Jarak antarbagian", symbol: "↕" },
  { kind: "image", label: "Gambar", description: "Foto atau logo", symbol: "▧" },
];

export const visualBlockCss = `
/* Blok dari editor visual */
.builder-heading { font-size: 22px; line-height: 1.3; margin: 20px 0 12px; color: #243047; }
.builder-paragraph { font-size: 12px; line-height: 1.8; margin: 10px 0 16px; white-space: pre-wrap; }
.builder-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 20px 0; font-size: 12px; line-height: 1.7; }
.builder-columns > div { padding: 15px; background: #f5f7fb; border-radius: 5px; white-space: pre-wrap; }
.builder-table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 11px; }
.builder-table th, .builder-table td { border: 1px solid #e1e6ef; padding: 10px 12px; text-align: left; }
.builder-table th { background: #f3f6fb; font-weight: 700; }
.builder-divider { border: 0; border-top: 1px solid #dbe3ee; margin: 24px 0; }
.builder-spacer { height: 32px; }
.builder-image { display: block; max-width: 100%; height: auto; margin: 18px 0; }
`;

const newMarkup: Record<BlockKind, string> = {
  heading: '<h2 class="builder-heading" data-builder-kind="heading" data-builder-field="text">Judul baru</h2>',
  paragraph: '<p class="builder-paragraph" data-builder-kind="paragraph" data-builder-field="text">Tulis isi paragraf di sini.</p>',
  columns: '<div class="builder-columns" data-builder-kind="columns"><div data-builder-field="left">Konten kolom kiri</div><div data-builder-field="right">Konten kolom kanan</div></div>',
  table: '<table class="builder-table" data-builder-kind="table"><thead><tr><th data-builder-field="head1">Kolom 1</th><th data-builder-field="head2">Kolom 2</th></tr></thead><tbody><tr><td data-builder-field="cell1">Isi 1</td><td data-builder-field="cell2">Isi 2</td></tr></tbody></table>',
  divider: '<hr class="builder-divider" data-builder-kind="divider">',
  spacer: '<div class="builder-spacer" data-builder-kind="spacer"></div>',
  image: '<img class="builder-image" data-builder-kind="image" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22240%22%3E%3Crect width=%22600%22 height=%22240%22 fill=%22%23edf1f8%22/%3E%3Ctext x=%22300%22 y=%22128%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2220%22 fill=%22%2395a3b9%22%3EGambar dokumen%3C/text%3E%3C/svg%3E" alt="Gambar dokumen">',
};

function parse(markup: string) {
  const doc = new DOMParser().parseFromString(markup, "text/html");
  const root = doc.querySelector(".page") ?? doc.body;
  return { doc, root };
}

function serialize(doc: Document, markup: string): string {
  return /<!doctype|<html[\s>]/i.test(markup) ? `<!DOCTYPE html>\n${doc.documentElement.outerHTML}` : doc.body.innerHTML.trim();
}

export type VisualBlock = { index: number; kind: string; label: string; excerpt: string; html: string };

export function getBlocks(markup: string): VisualBlock[] {
  const { root } = parse(markup);
  return Array.from(root.children).map((element, index) => {
    const kind = element.getAttribute("data-builder-kind") ?? element.tagName.toLowerCase();
    const label = blockPalette.find((item) => item.kind === kind)?.label ?? ({ header: "Header", footer: "Footer", section: "Bagian", table: "Tabel", div: "Konten", h1: "Judul", h2: "Subjudul", p: "Paragraf" }[kind] ?? "Blok");
    const excerpt = element.textContent?.replace(/\s+/g, " ").trim().slice(0, 105) || (kind === "image" ? "Gambar dokumen" : "Elemen visual");
    return { index, kind, label, excerpt, html: element.outerHTML };
  });
}

export function insertBlock(markup: string, kind: BlockKind, index: number): string {
  const { doc, root } = parse(markup);
  const fragment = doc.createElement("template");
  fragment.innerHTML = newMarkup[kind];
  root.insertBefore(fragment.content, root.children[index] ?? null);
  return serialize(doc, markup);
}

export function moveBlock(markup: string, from: number, to: number): string {
  const { doc, root } = parse(markup);
  const item = root.children[from];
  if (!item || from === to || from + 1 === to) return markup;
  root.insertBefore(item, root.children[to > from ? to : to] ?? null);
  return serialize(doc, markup);
}

export function removeBlock(markup: string, index: number): string {
  const { doc, root } = parse(markup);
  root.children[index]?.remove();
  return serialize(doc, markup);
}

export function replaceBlock(markup: string, index: number, blockHtml: string): string {
  const { doc, root } = parse(markup);
  const item = root.children[index];
  if (!item) return markup;
  const fragment = doc.createElement("template");
  fragment.innerHTML = blockHtml;
  if (fragment.content.children.length !== 1) return markup;
  item.replaceWith(fragment.content.firstElementChild!);
  return serialize(doc, markup);
}

export function updateBlockField(markup: string, index: number, field: string, value: string): string {
  const { doc, root } = parse(markup);
  const item = root.children[index];
  if (!item) return markup;
  if (field === "src" || field === "alt") item.setAttribute(field, value);
  else if (field === "height") item.setAttribute("style", `height: ${Math.min(300, Math.max(8, Number(value) || 32))}px`);
  else {
    const target = item.getAttribute("data-builder-field") === field ? item : item.querySelector(`[data-builder-field="${field}"]`);
    if (target) target.textContent = value;
  }
  return serialize(doc, markup);
}
