"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { completeHtml, previewHtml } from "./builder";
import { templates } from "./templates";
import VisualEditor from "./visual-editor";

type Tab = "visual" | "html" | "css" | "data";
type IconName = "grid" | "layers" | "code" | "eye" | "copy" | "download" | "printer" | "chevron" | "check" | "file" | "spark" | "refresh" | "menu" | "close";
type Workspace = { id: string; name: string; html: string; css: string; data: string; templateId: string; updatedAt: number };
const storageKey = "papercraft-workspaces-v1";
const initialWorkspace: Workspace = { id: "initial", name: templates[0].name, html: templates[0].html, css: templates[0].css, data: templates[0].data, templateId: templates[0].id, updatedAt: 0 };

function readSavedWorkspaces(): { activeId: string; items: Workspace[] } | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const saved = value as { activeId?: unknown; items?: unknown };
    if (typeof saved.activeId !== "string" || !Array.isArray(saved.items)) return null;
    const items = saved.items.filter((item): item is Workspace => item && typeof item === "object" && typeof item.id === "string" && typeof item.name === "string" && typeof item.html === "string" && typeof item.css === "string" && typeof item.data === "string" && typeof item.templateId === "string" && typeof item.updatedAt === "number");
    return items.some((item) => item.id === saved.activeId) ? { activeId: saved.activeId, items } : null;
  } catch { return null; }
}

function makeWorkspace(templateId: string): Workspace {
  const template = templates.find((item) => item.id === templateId) ?? templates[0];
  return { id: crypto.randomUUID(), name: template.name, html: template.html, css: template.css, data: template.data, templateId: template.id, updatedAt: Date.now() };
}

function writeWorkspaces(items: Workspace[], activeId: string) {
  try { window.localStorage.setItem(storageKey, JSON.stringify({ activeId, items })); } catch { /* Penyimpanan mungkin dibatasi browser. */ }
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>,
    code: <><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3" /></>,
    printer: <><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v7H6z" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    check: <path d="m4 12 5 5L20 6" />,
    file: <><path d="M5 2h9l5 5v15H5z" /><path d="M14 2v6h5M8 13h8M8 17h8" /></>,
    spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2ZM19 17l.7 1.3L21 19l-1.3.7L19 21l-.7-1.3L17 19l1.3-.7L19 17Z" /></>,
    refresh: <><path d="M20 11a8 8 0 1 0-2.2 6M20 4v7h-7" /></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="M5 5l14 14M19 5 5 19" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Home() {
  const [selected, setSelected] = useState(templates[0].id);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([initialWorkspace]);
  const [activeId, setActiveId] = useState(initialWorkspace.id);
  const [hydrated, setHydrated] = useState(false);
  const [html, setHtml] = useState(templates[0].html);
  const [css, setCss] = useState(templates[0].css);
  const [data, setData] = useState(templates[0].data);
  const [tab, setTab] = useState<Tab>("visual");
  const [documentName, setDocumentName] = useState(templates[0].name);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scale, setScale] = useState(80);

  const parsed = useMemo(() => {
    try {
      const value: unknown = JSON.parse(data);
      if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Data JSON harus berupa objek.");
      return { value: value as Record<string, unknown>, error: "" };
    } catch (error) { return { value: {}, error: error instanceof Error ? error.message : "JSON tidak valid" }; }
  }, [data]);

  const isClient = useSyncExternalStore(() => () => {}, () => true, () => false);
  const preview = useMemo(() => isClient ? previewHtml(html, css, parsed.value) : "", [isClient, html, css, parsed.value]);
  const output = useMemo(() => completeHtml(html, css), [html, css]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readSavedWorkspaces();
      if (saved) {
        const active = saved.items.find((item) => item.id === saved.activeId)!;
        setWorkspaces(saved.items);
        setActiveId(active.id);
        setSelected(active.templateId);
        setHtml(active.html);
        setCss(active.css);
        setData(active.data);
        setDocumentName(active.name);
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      const items = workspaces.map((item) => item.id === activeId ? { ...item, name: documentName, html, css, data, templateId: selected, updatedAt: Date.now() } : item);
      writeWorkspaces(items, activeId);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [hydrated, workspaces, activeId, documentName, html, css, data, selected]);

  function snapshot(): Workspace[] {
    return workspaces.map((item) => item.id === activeId ? { ...item, name: documentName, html, css, data, templateId: selected, updatedAt: Date.now() } : item);
  }

  function openWorkspace(id: string) {
    if (id === activeId) return;
    const items = snapshot();
    const next = items.find((item) => item.id === id);
    if (!next) return;
    writeWorkspaces(items, id);
    setWorkspaces(items);
    setActiveId(id);
    setSelected(next.templateId);
    setHtml(next.html); setCss(next.css); setData(next.data); setDocumentName(next.name);
    setTab("visual"); setMobileMenu(false);
  }

  function createWorkspace(templateId = templates[0].id) {
    const next = makeWorkspace(templateId);
    const items = [next, ...snapshot()];
    writeWorkspaces(items, next.id);
    setWorkspaces(items);
    setActiveId(next.id);
    setSelected(next.templateId);
    setHtml(next.html); setCss(next.css); setData(next.data); setDocumentName(next.name);
    setTab("visual"); setMobileMenu(false);
    setToast("Workspace baru dibuat");
  }

  function deleteWorkspace(id: string) {
    const target = workspaces.find((item) => item.id === id);
    if (!target || !window.confirm(`Hapus workspace “${target.name}”?`)) return;
    const remaining = snapshot().filter((item) => item.id !== id);
    const items = remaining.length ? remaining : [makeWorkspace(templates[0].id)];
    writeWorkspaces(items, id === activeId ? items[0].id : activeId);
    setWorkspaces(items);
    if (id === activeId) {
      const next = items[0];
      setActiveId(next.id); setSelected(next.templateId);
      setHtml(next.html); setCss(next.css); setData(next.data); setDocumentName(next.name);
      setTab("visual");
    }
    setToast("Workspace dihapus");
  }

  function chooseTemplate(id: string) {
    createWorkspace(id);
  }

  async function copyOutput() {
    try { await navigator.clipboard.writeText(output); setToast("HTML lengkap berhasil disalin"); }
    catch { setToast("Gagal menyalin. Gunakan Unduh HTML."); }
  }

  function downloadHtml() {
    const url = URL.createObjectURL(new Blob([output], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `${documentName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "dokumen"}.html`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast("Template HTML berhasil diunduh");
  }

  function printPdf() {
    const frame = document.createElement("iframe");
    frame.style.position = "fixed"; frame.style.width = "0"; frame.style.height = "0"; frame.style.border = "0"; frame.style.opacity = "0";
    document.body.appendChild(frame);
    frame.onload = () => {
      window.setTimeout(() => {
        frame.contentWindow?.focus(); frame.contentWindow?.print();
        window.setTimeout(() => frame.remove(), 60000);
      }, 250);
    };
    frame.srcdoc = preview;
    setToast("Pilih ‘Save as PDF’ pada dialog cetak");
  }

  const current = tab === "html" ? html : tab === "css" ? css : data;
  const setCurrent = tab === "html" ? setHtml : tab === "css" ? setCss : setData;
  const lineCount = current.split("\n").length;

  return <div className="app-shell">
    {mobileMenu && <div className="mobile-overlay" onClick={() => setMobileMenu(false)} />}
    <aside className={`sidebar ${mobileMenu ? "is-open" : ""}`}>
      <div className="brand-row"><div className="app-logo"><Icon name="layers" size={21} /></div><div className="app-brand">paper<span>craft</span><small>PDF BUILDER</small></div><button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Tutup menu"><Icon name="close" /></button></div>
      <div className="sidebar-section"><div className="section-heading">WORKSPACE</div><button className="nav-item active"><Icon name="grid" size={17} /> Template Builder</button><div className="workspace-list-heading"><span>DOKUMEN SAYA <small>{workspaces.length}</small></span><button type="button" onClick={() => createWorkspace()} aria-label="Buat workspace baru" title="Buat workspace baru">+</button></div><div className="workspace-list">{workspaces.map((item) => <div key={item.id} className={`workspace-row ${activeId === item.id ? "selected" : ""}`}><button type="button" className="workspace-open" onClick={() => openWorkspace(item.id)}><span className="workspace-file"><Icon name="file" size={15} /></span><span><strong>{activeId === item.id ? documentName.trim() || "Tanpa nama" : item.name.trim() || "Tanpa nama"}</strong><small>{item.templateId === "blank" ? "Dokumen kosong" : templates.find((template) => template.id === item.templateId)?.name ?? "Dokumen"}</small></span></button><button type="button" className="workspace-delete" onClick={() => deleteWorkspace(item.id)} aria-label={`Hapus workspace ${item.name}`} title="Hapus workspace">×</button></div>)}</div><div className="section-heading template-heading">MULAI DARI TEMPLATE <span>{templates.length}</span></div><div className="template-list">{templates.map((item) => <button key={item.id} className="template-item" onClick={() => chooseTemplate(item.id)}><span className="template-icon"><Icon name="file" size={17} /></span><span className="template-copy"><strong>{item.name}</strong><small>{item.category}</small></span></button>)}</div></div>
      <div className="sidebar-bottom"><div className="tip-icon"><Icon name="spark" size={17} /></div><strong>Siap untuk Thymeleaf</strong><p>Ekspor HTML dengan atribut <code>th:*</code> dan CSS di dalam tag <code>&lt;style&gt;</code>.</p><span className="tip-link">Template siap pakai <Icon name="chevron" size={14} /></span></div>
    </aside>

    <div className="main-area"><header className="topbar"><div className="breadcrumbs"><button className="icon-button menu-button" onClick={() => setMobileMenu(true)} aria-label="Buka menu"><Icon name="menu" /></button><span>Workspace</span><Icon name="chevron" size={14} /><strong>{documentName.trim() || "Tanpa nama"}</strong></div><div className="top-actions"><span className="saved-pill"><span /> Tersimpan di browser</span><button className="button button-outline header-download" onClick={downloadHtml}><Icon name="download" size={16} /> Unduh HTML</button><button className="button button-primary" onClick={printPdf}><Icon name="printer" size={16} /> Preview PDF</button></div></header>

    <main className="workspace"><div className="workspace-heading"><div><div className="heading-kicker"><span className="kicker-dot" /> DOCUMENT STUDIO <span className="kicker-line" /> TEMPLATE EDITOR</div><div className="title-row"><h1>PDF Template Builder</h1><span className="beta-pill">BETA</span></div><p>Buat dokumen dinamis yang tampil rapi di browser, PDF, dan Thymeleaf.</p></div><div className="heading-actions"><button className="button button-subtle" onClick={copyOutput}><Icon name="copy" size={16} /> Salin HTML</button><button className="button button-dark" onClick={downloadHtml}><Icon name="download" size={16} /> Ekspor Template</button></div></div>

    <div className="editor-grid"><section className="panel editor-panel"><div className="panel-top"><div><div className="panel-eyebrow">01 / KONFIGURASI</div><h2>Editor Template</h2><p>Susun blok atau sesuaikan kode dokumen Anda.</p></div><span className="panel-icon"><Icon name="layers" size={19} /></span></div><div className="document-field"><label htmlFor="documentName">NAMA DOKUMEN</label><input id="documentName" value={documentName} onChange={(event) => setDocumentName(event.target.value)} placeholder="Nama dokumen" /></div><div className="tabs" role="tablist" aria-label="Bagian editor"><button role="tab" aria-selected={tab === "visual"} className={tab === "visual" ? "active" : ""} onClick={() => setTab("visual")}><Icon name="layers" size={15} /> Visual</button><button role="tab" aria-selected={tab === "html"} className={tab === "html" ? "active" : ""} onClick={() => setTab("html")}><Icon name="code" size={15} /> HTML</button><button role="tab" aria-selected={tab === "css"} className={tab === "css" ? "active" : ""} onClick={() => setTab("css")}><span className="css-icon">#</span> CSS</button><button role="tab" aria-selected={tab === "data"} className={tab === "data" ? "active" : ""} onClick={() => setTab("data")}><span className="data-icon">{`{}`}</span> Data Contoh</button></div>{tab === "visual" ? <VisualEditor key={activeId} html={html} css={css} onHtmlChange={setHtml} onCssChange={setCss} /> : <><div className="editor-toolbar"><span><span className="file-dot" />{tab === "html" ? "template.html" : tab === "css" ? "styles.css" : "sample-data.json"}</span><span>{lineCount} baris</span></div><div className="code-editor"><div className="line-numbers" aria-hidden="true">{Array.from({ length: Math.max(lineCount, 25) }, (_, index) => <div key={index}>{index + 1}</div>)}</div><textarea spellCheck={false} aria-label={tab === "html" ? "Kode HTML" : tab === "css" ? "Kode CSS" : "Data JSON contoh"} value={current} onChange={(event) => setCurrent(event.target.value)} /></div><div className="editor-foot"><span className={tab === "data" && parsed.error ? "error-text" : ""}>{tab === "data" && parsed.error ? `JSON tidak valid: ${parsed.error}` : tab === "html" ? "Atribut th:* tetap utuh saat diekspor" : tab === "css" ? "CSS akan disisipkan ke tag <style>" : "Data ini hanya untuk pratinjau"}</span><span className="language-tag">{tab.toUpperCase()}</span></div></>}</section>

    <section className="panel preview-panel"><div className="panel-top preview-top"><div><div className="panel-eyebrow">02 / HASIL AKHIR</div><h2>Live Preview</h2><p>Pratinjau dokumen dalam ukuran kertas A4.</p></div><span className="live-pill"><span /> LIVE</span></div><div className="preview-toolbar"><div className="preview-label"><Icon name="eye" size={17} /><span>Pratinjau dokumen</span><span className="a4-pill">A4</span></div><div className="zoom-controls"><button onClick={() => setScale((value) => Math.max(50, value - 10))} aria-label="Perkecil">−</button><span>{scale}%</span><button onClick={() => setScale((value) => Math.min(120, value + 10))} aria-label="Perbesar">+</button></div></div><div className="preview-stage"><div className="paper-holder" style={{ width: `${794 * scale / 100}px`, minHeight: `${1123 * scale / 100}px` }}><iframe title="Pratinjau template" sandbox="allow-same-origin" srcDoc={preview} style={{ width: "794px", height: "1123px", transform: `scale(${scale / 100})` }} /></div></div><div className="preview-foot"><span><span className="green-dot" /> Pratinjau diperbarui otomatis</span><button onClick={printPdf}>Buka preview PDF <Icon name="chevron" size={15} /></button></div></section></div>

    <div className="info-strip"><div className="info-icon"><Icon name="spark" size={19} /></div><div><strong>Satu template, banyak kegunaan</strong><p>HTML berisi CSS internal dan atribut Thymeleaf. Data contoh digunakan hanya untuk preview; ekspor tetap memakai ekspresi asli.</p></div><span>HTML + CSS + THYMELEAF</span></div>
    </main></div>{toast && <div className="toast"><Icon name="check" size={16} />{toast}</div>}</div>;
}
