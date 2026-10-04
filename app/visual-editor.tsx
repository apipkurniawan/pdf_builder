"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { blockPalette, getBlocks, insertBlock, moveBlock, removeBlock, replaceBlock, updateBlockField, visualBlockCss, type BlockKind } from "./visual-builder";

type Props = { html: string; css: string; onHtmlChange: (value: string) => void; onCssChange: (value: string) => void };
type DragItem = { type: "new"; kind: BlockKind } | { type: "move"; index: number };
const dragType = "application/x-papercraft-block";

function HtmlBlockEditor({ value, onApply }: { value: string; onApply: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  return <div className="inspector-field"><label htmlFor="blockHtml">HTML blok</label><textarea id="blockHtml" className="block-html-input" value={draft} onChange={(event) => setDraft(event.target.value)} rows={9} spellCheck={false} /><button className="apply-block" type="button" onClick={() => onApply(draft)}>Terapkan perubahan</button></div>;
}

export default function VisualEditor({ html, css, onHtmlChange, onCssChange }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const isClient = useSyncExternalStore(() => () => {}, () => true, () => false);
  const blocks = useMemo(() => isClient ? getBlocks(html) : [], [html, isClient]);
  const active = selected === null ? null : blocks[selected] ?? null;

  function ensureStyles() {
    if (!css.includes("/* Blok dari editor visual */")) onCssChange(`${css.trimEnd()}\n${visualBlockCss}`);
  }

  function add(kind: BlockKind, at = blocks.length) {
    ensureStyles();
    onHtmlChange(insertBlock(html, kind, at));
    setSelected(at);
    setDropIndex(null);
  }

  function drop(event: React.DragEvent, at: number) {
    event.preventDefault();
    setDropIndex(null);
    try {
      const item = JSON.parse(event.dataTransfer.getData(dragType)) as DragItem;
      if (item.type === "new" && blockPalette.some((entry) => entry.kind === item.kind)) add(item.kind, at);
      if (item.type === "move" && Number.isInteger(item.index) && item.index >= 0 && item.index < blocks.length) {
        onHtmlChange(moveBlock(html, item.index, at));
        setSelected(at > item.index ? at - 1 : at);
      }
    } catch { /* Abaikan data drag dari aplikasi lain. */ }
  }

  function dragOver(event: React.DragEvent, at: number) {
    if (!event.dataTransfer.types.includes(dragType)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropIndex(at);
  }

  function field(name: string, label: string, value: string, multiline = false) {
    return <label className="inspector-field" key={name}><span>{label}</span>{multiline ? <textarea value={value} onChange={(event) => onHtmlChange(updateBlockField(html, selected!, name, event.target.value))} rows={4} /> : <input value={value} onChange={(event) => onHtmlChange(updateBlockField(html, selected!, name, event.target.value))} />}</label>;
  }

  function editableFields() {
    if (!active) return null;
    const doc = new DOMParser().parseFromString(active.html, "text/html");
    const element = doc.body.firstElementChild;
    if (!element) return null;
    const kind = active.kind;
    if (kind === "heading" || kind === "paragraph") return field("text", "Teks", element.textContent ?? "", kind === "paragraph");
    if (kind === "columns") return <>{field("left", "Kolom kiri", element.querySelector('[data-builder-field="left"]')?.textContent ?? "", true)}{field("right", "Kolom kanan", element.querySelector('[data-builder-field="right"]')?.textContent ?? "", true)}</>;
    if (kind === "table") return <>{field("head1", "Judul kolom 1", element.querySelector('[data-builder-field="head1"]')?.textContent ?? "")}{field("head2", "Judul kolom 2", element.querySelector('[data-builder-field="head2"]')?.textContent ?? "")}{field("cell1", "Isi baris 1", element.querySelector('[data-builder-field="cell1"]')?.textContent ?? "")}{field("cell2", "Isi baris 2", element.querySelector('[data-builder-field="cell2"]')?.textContent ?? "")}</>;
    if (kind === "image") return <>{field("src", "URL gambar", element.getAttribute("src") ?? "")}{field("alt", "Deskripsi gambar", element.getAttribute("alt") ?? "")}</>;
    if (kind === "spacer") return field("height", "Tinggi (px)", element.getAttribute("style")?.match(/\d+/)?.[0] ?? "32");
    return <HtmlBlockEditor key={`${selected}:${active.html}`} value={active.html} onApply={(value) => onHtmlChange(replaceBlock(html, selected!, value))} />;
  }

  return <div className="visual-editor">
    <div className="visual-intro"><strong>Susun konten dengan blok</strong><p>Tarik elemen ke daftar, lalu tarik blok untuk mengubah urutan. Klik blok untuk mengedit isinya.</p></div>
    <div className="palette-title">ELEMEN DOKUMEN</div>
    <div className="block-palette">{blockPalette.map((item) => <div className="palette-item" key={item.kind} draggable onDragStart={(event) => event.dataTransfer.setData(dragType, JSON.stringify({ type: "new", kind: item.kind }))}><span className="palette-symbol">{item.symbol}</span><span><strong>{item.label}</strong><small>{item.description}</small></span><button type="button" onClick={() => add(item.kind)} aria-label={`Tambah ${item.label}`}>+</button></div>)}</div>
    <div className="canvas-heading"><span>URUTAN KONTEN <em>{blocks.length} blok</em></span><span>Tarik untuk menyusun</span></div>
    <div className="block-canvas">
      {blocks.map((block, index) => <div key={index}>
        <div className={`drop-zone ${dropIndex === index ? "is-over" : ""}`} onDragOver={(event) => dragOver(event, index)} onDragLeave={() => setDropIndex(null)} onDrop={(event) => drop(event, index)}><span>Letakkan di sini</span></div>
        <div className={`canvas-block ${selected === index ? "is-selected" : ""}`} draggable onDragStart={(event) => event.dataTransfer.setData(dragType, JSON.stringify({ type: "move", index }))} onDragEnd={() => setDropIndex(null)} onClick={() => setSelected(index)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") setSelected(index); }}>
          <span className="drag-handle" aria-hidden="true">⠿</span><span className="block-number">{String(index + 1).padStart(2, "0")}</span><span className="block-summary"><strong>{block.label}</strong><small>{block.excerpt}</small></span><span className="block-arrow">›</span>
        </div>
      </div>)}
      <div className={`drop-zone last ${dropIndex === blocks.length ? "is-over" : ""}`} onDragOver={(event) => dragOver(event, blocks.length)} onDragLeave={() => setDropIndex(null)} onDrop={(event) => drop(event, blocks.length)}><span>Letakkan di sini</span></div>
      {blocks.length === 0 && <p className="empty-blocks">Tarik elemen ke sini atau tekan tombol + untuk mulai.</p>}
    </div>
    {active && <div className="block-inspector"><div className="inspector-heading"><div><span>EDIT BLOK {String(active.index + 1).padStart(2, "0")}</span><strong>{active.label}</strong></div><button type="button" onClick={() => { onHtmlChange(removeBlock(html, selected!)); setSelected(null); }}>Hapus blok</button></div><div className="block-order"><button type="button" disabled={selected === 0} onClick={() => { onHtmlChange(moveBlock(html, selected!, selected! - 1)); setSelected(selected! - 1); }}>↑ Naik</button><button type="button" disabled={selected === blocks.length - 1} onClick={() => { onHtmlChange(moveBlock(html, selected!, selected! + 2)); setSelected(selected! + 1); }}>↓ Turun</button></div>{editableFields()}<p>Perubahan langsung muncul di preview A4.</p></div>}
  </div>;
}
