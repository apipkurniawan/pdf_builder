export type Template = {
  id: string;
  name: string;
  category: string;
  description: string;
  html: string;
  css: string;
  data: string;
};

const baseCss = `@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; color: #243047; font-family: Arial, Helvetica, sans-serif; background: #fff; }
.page { width: 210mm; min-height: 297mm; padding: 23mm 21mm; margin: 0 auto; background: #fff; }
.muted { color: #77849a; }
.eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #4f6edb; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page { width: auto; min-height: 0; margin: 0; } }`;

export const templates: Template[] = [
  {
    id: "invoice",
    name: "Invoice Modern",
    category: "Keuangan",
    description: "Tagihan profesional dengan rincian item dan total.",
    html: `<div class="page">
  <div class="topline"></div>
  <header class="header">
    <div class="brand"><span class="brand-mark">N</span><div><strong>NORTHSTAR</strong><small>Creative Studio</small></div></div>
    <div class="invoice-label"><span class="eyebrow">DOKUMEN TAGIHAN</span><h1>INVOICE</h1><p th:text="\${invoice.number}">INV-2026-001</p></div>
  </header>

  <section class="summary">
    <div><span class="field-label">DITAGIHKAN KEPADA</span><h2 th:text="\${client.name}">PT Cakrawala Digital</h2><p th:text="\${client.address}">Jl. Jenderal Sudirman No. 12<br>Jakarta Selatan, 12190</p><p th:text="\${client.email}">finance@cakrawala.co.id</p></div>
    <div class="meta"><div><span>Tanggal terbit</span><strong th:text="\${invoice.date}">03 Oktober 2026</strong></div><div><span>Jatuh tempo</span><strong th:text="\${invoice.dueDate}">17 Oktober 2026</strong></div><div><span>Status</span><strong class="status" th:text="\${invoice.status}">Menunggu pembayaran</strong></div></div>
  </section>

  <table><thead><tr><th>DESKRIPSI</th><th>QTY</th><th>HARGA</th><th>JUMLAH</th></tr></thead><tbody>
    <tr th:each="item : \${items}"><td><strong th:text="\${item.name}">Desain identitas brand</strong><small th:text="\${item.description}">Konsep, panduan visual, dan aset</small></td><td th:text="\${item.quantity}">1</td><td th:text="\${item.price}">Rp 8.500.000</td><td th:text="\${item.total}">Rp 8.500.000</td></tr>
  </tbody></table>

  <div class="bottom-grid"><div class="payment"><span class="field-label">INFORMASI PEMBAYARAN</span><strong>Bank Central Asia (BCA)</strong><p>123 456 7890 · a.n. Northstar Studio</p><p class="note">Mohon cantumkan nomor invoice pada berita transfer.</p></div><div class="totals"><div><span>Subtotal</span><span th:text="\${invoice.subtotal}">Rp 12.000.000</span></div><div><span>PPN (11%)</span><span th:text="\${invoice.tax}">Rp 1.320.000</span></div><div class="grand"><span>Total tagihan</span><strong th:text="\${invoice.total}">Rp 13.320.000</strong></div></div></div>
  <footer><span>Terima kasih atas kepercayaan Anda.</span><span>northstar.studio · hello@northstar.studio</span></footer>
</div>`,
    css: `${baseCss}
.topline { height: 5px; width: 55px; background: #4f6edb; border-radius: 4px; margin-bottom: 35px; }
.header, .summary, .bottom-grid, footer { display: flex; justify-content: space-between; }
.header { align-items: flex-start; margin-bottom: 57px; }
.brand { display: flex; gap: 12px; align-items: center; }
.brand-mark { display: grid; place-items: center; width: 38px; height: 38px; background: #4f6edb; color: white; border-radius: 10px; font-size: 23px; font-weight: 700; }
.brand strong { display: block; letter-spacing: 2px; font-size: 15px; }.brand small { display: block; color: #8a96a9; font-size: 10px; margin-top: 3px; letter-spacing: 1.4px; }
.invoice-label { text-align: right; }.invoice-label h1 { font-size: 31px; letter-spacing: 3px; margin: 7px 0 4px; color: #1d2b47; }.invoice-label p { margin: 0; font-size: 12px; color: #8190a4; }
.summary { gap: 35px; margin-bottom: 47px; }.summary > div:first-child { max-width: 55%; }.field-label { display: block; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #8b97aa; margin-bottom: 13px; }.summary h2 { font-size: 16px; margin: 0 0 10px; }.summary p { font-size: 11px; line-height: 1.8; color: #65748a; margin: 4px 0; }.meta { width: 220px; }.meta div { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 14px; font-size: 11px; }.meta span { color: #8793a7; }.meta strong { text-align: right; font-weight: 600; }.meta .status { color: #d18b35; }
table { width: 100%; border-collapse: collapse; } th { background: #f3f6fb; color: #7b8aa2; font-size: 9px; letter-spacing: 1px; text-align: right; padding: 15px 12px; } th:first-child { text-align: left; width: 48%; } td { font-size: 11px; padding: 18px 12px; text-align: right; border-bottom: 1px solid #e8edf4; vertical-align: top; } td:first-child { text-align: left; } td strong { display: block; font-weight: 600; } td small { display: block; margin-top: 5px; color: #97a2b3; font-size: 10px; }
.bottom-grid { gap: 30px; margin-top: 35px; }.payment { padding-top: 6px; }.payment strong { font-size: 12px; }.payment p { font-size: 11px; margin: 8px 0; }.payment .note { color: #9aa5b5; font-size: 10px; margin-top: 23px; }.totals { width: 245px; flex-shrink: 0; }.totals div { display: flex; justify-content: space-between; padding: 10px 0; font-size: 11px; }.totals div span:first-child { color: #8090a4; }.totals .grand { border-top: 1px solid #dce3ed; margin-top: 5px; padding-top: 18px; align-items: center; }.totals .grand span { color: #243047 !important; font-weight: 700; }.totals .grand strong { color: #4f6edb; font-size: 17px; }
footer { border-top: 1px solid #e8edf4; color: #a1adbd; font-size: 9px; margin-top: 95px; padding-top: 18px; }`,
    data: JSON.stringify({ invoice: { number: "INV-2026-001", date: "03 Oktober 2026", dueDate: "17 Oktober 2026", status: "Menunggu pembayaran", subtotal: "Rp 12.000.000", tax: "Rp 1.320.000", total: "Rp 13.320.000" }, client: { name: "PT Cakrawala Digital", address: "Jl. Jenderal Sudirman No. 12, Jakarta Selatan, 12190", email: "finance@cakrawala.co.id" }, items: [{ name: "Desain identitas brand", description: "Konsep, panduan visual, dan aset", quantity: "1", price: "Rp 8.500.000", total: "Rp 8.500.000" }, { name: "Desain landing page", description: "UI desktop dan mobile", quantity: "1", price: "Rp 3.500.000", total: "Rp 3.500.000" }] }, null, 2),
  },
  {
    id: "letter",
    name: "Surat Resmi",
    category: "Bisnis",
    description: "Surat formal siap cetak dengan kop dan tanda tangan.",
    html: `<div class="page"><header class="letter-head"><div class="logo">A</div><div><h1>ATLAS GROUP</h1><p>Building better futures, together.</p></div><span>atlasgroup.id</span></header><div class="rule"></div><div class="letter-meta"><p>Nomor: <span th:text="\${letter.number}">AG/041/X/2026</span></p><p>Lampiran: <span th:text="\${letter.attachment}">—</span></p><p>Perihal: <strong th:text="\${letter.subject}">Undangan Kerja Sama</strong></p></div><div class="date" th:text="\${letter.date}">Jakarta, 03 Oktober 2026</div><div class="recipient">Kepada Yth.<br><strong th:text="\${recipient.name}">Bapak/Ibu Direktur</strong><br><span th:text="\${recipient.company}">PT Mitra Sejahtera</span><br>di tempat</div><div class="content"><p>Dengan hormat,</p><p th:text="\${letter.opening}">Melalui surat ini, kami bermaksud mengundang perusahaan Anda untuk menjajaki peluang kerja sama strategis.</p><p th:text="\${letter.body}">Kami percaya pengalaman dan visi kedua perusahaan dapat menciptakan nilai yang berarti. Besar harapan kami untuk dapat bertemu dan mendiskusikan rencana ini lebih lanjut pada waktu yang sesuai.</p><p th:text="\${letter.closing}">Demikian surat ini kami sampaikan. Atas perhatian dan kerja sama Anda, kami mengucapkan terima kasih.</p></div><div class="signature"><p>Hormat kami,</p><div class="sign-space"></div><strong th:text="\${sender.name}">Nadia Putri</strong><span th:text="\${sender.role}">Direktur Utama</span></div><footer>ATLAS GROUP · Jl. Senopati No. 88, Jakarta Selatan · +62 21 555 0190</footer></div>`,
    css: `${baseCss}
.letter-head { display:flex; align-items:center; gap:14px; }.logo { width:45px; height:45px; background:#264c7b; border-radius:4px; color:white; font:bold 27px Georgia; display:grid; place-items:center; }.letter-head h1 { font-size:17px; letter-spacing:2px; margin:0; }.letter-head p { color:#8390a3; font-size:10px; margin:5px 0 0; }.letter-head > span { margin-left:auto; color:#8390a3; font-size:10px; }.rule { height:2px; background:#264c7b; margin:22px 0 38px; }.letter-meta p { font-size:11px; margin:7px 0; }.letter-meta { margin-bottom:33px; }.date { text-align:right; font-size:11px; margin-bottom:30px; }.recipient { font-size:11px; line-height:1.8; margin-bottom:30px; }.content { font-size:12px; line-height:2.05; text-align:justify; }.content p { margin:0 0 18px; }.signature { margin-top:38px; font-size:11px; }.sign-space { height:75px; }.signature strong,.signature span { display:block; margin-bottom:5px; }.signature span { color:#8190a4; } footer { border-top:1px solid #dce4ef; margin-top:100px; padding-top:15px; color:#8795a7; text-align:center; font-size:9px; }`,
    data: JSON.stringify({ letter: { number: "AG/041/X/2026", attachment: "—", subject: "Undangan Kerja Sama", date: "Jakarta, 03 Oktober 2026", opening: "Melalui surat ini, kami bermaksud mengundang perusahaan Anda untuk menjajaki peluang kerja sama strategis.", body: "Kami percaya pengalaman dan visi kedua perusahaan dapat menciptakan nilai yang berarti. Besar harapan kami untuk dapat bertemu dan mendiskusikan rencana ini lebih lanjut pada waktu yang sesuai.", closing: "Demikian surat ini kami sampaikan. Atas perhatian dan kerja sama Anda, kami mengucapkan terima kasih." }, recipient: { name: "Bapak/Ibu Direktur", company: "PT Mitra Sejahtera" }, sender: { name: "Nadia Putri", role: "Direktur Utama" } }, null, 2),
  },
  {
    id: "report",
    name: "Laporan Ringkas",
    category: "Laporan",
    description: "Halaman laporan dengan metrik dan ringkasan.",
    html: `<div class="page"><header><div class="eyebrow">LAPORAN BULANAN / 2026</div><div class="head-row"><h1 th:text="\${report.title}">Ringkasan Kinerja</h1><span class="badge" th:text="\${report.period}">September 2026</span></div><p class="subtitle" th:text="\${report.subtitle}">Ikhtisar performa bisnis dan pencapaian utama bulan ini.</p></header><section class="metrics"><div><span>TOTAL PENDAPATAN</span><strong th:text="\${metrics.revenue}">Rp 284,5 jt</strong><small>↑ 18,2% dari bulan lalu</small></div><div><span>PROYEK AKTIF</span><strong th:text="\${metrics.projects}">24</strong><small>↑ 4 proyek baru</small></div><div><span>KEPUASAN KLIEN</span><strong th:text="\${metrics.satisfaction}">98%</strong><small>↑ 2% dari bulan lalu</small></div></section><section class="section"><h2>Ringkasan eksekutif</h2><p th:text="\${report.summary}">Kinerja bulan ini menunjukkan pertumbuhan yang stabil di seluruh lini bisnis. Fokus utama kami adalah meningkatkan efisiensi tim dan menjaga kualitas layanan.</p></section><section class="section"><h2>Sorotan utama</h2><div class="highlight"><span class="number">01</span><div><h3 th:text="\${highlights.first.title}">Pertumbuhan yang konsisten</h3><p th:text="\${highlights.first.detail}">Pendapatan meningkat seiring perluasan portofolio klien dan penyelesaian proyek utama.</p></div></div><div class="highlight"><span class="number">02</span><div><h3 th:text="\${highlights.second.title}">Kualitas layanan terjaga</h3><p th:text="\${highlights.second.detail}">Umpan balik positif klien menjadi dasar peningkatan proses kerja berikutnya.</p></div></div></section><footer><span>Disiapkan oleh Tim Strategi</span><span>01 / 01</span></footer></div>`,
    css: `${baseCss}
header { border-bottom:1px solid #e2e8f0; padding-bottom:33px; }.head-row { display:flex; align-items:center; justify-content:space-between; margin-top:18px; }.head-row h1 { font-size:30px; letter-spacing:-1px; margin:0; }.badge { background:#ecf1ff; color:#4f6edb; padding:9px 13px; border-radius:4px; font-size:10px; font-weight:700; }.subtitle { color:#8492a5; font-size:12px; margin:11px 0 0; }.metrics { display:flex; gap:12px; margin:38px 0 43px; }.metrics div { flex:1; background:#f5f7fb; padding:20px 15px; border-radius:5px; }.metrics span { display:block; color:#8b98a9; font-size:9px; letter-spacing:1px; font-weight:bold; }.metrics strong { display:block; font-size:21px; margin:14px 0 10px; color:#25334e; }.metrics small { color:#39a278; font-size:9px; }.section { margin-bottom:38px; }.section h2 { font-size:16px; margin:0 0 15px; }.section > p { color:#627189; font-size:12px; line-height:1.9; max-width:580px; }.highlight { display:flex; gap:18px; padding:20px 0; border-bottom:1px solid #edf0f5; }.number { font-size:12px; color:#5875d5; font-weight:bold; }.highlight h3 { margin:0 0 7px; font-size:12px; }.highlight p { margin:0; color:#7c8b9f; font-size:11px; line-height:1.7; }footer { display:flex; justify-content:space-between; color:#a2adbb; border-top:1px solid #e2e8f0; padding-top:16px; margin-top:85px; font-size:9px; }`,
    data: JSON.stringify({ report: { title: "Ringkasan Kinerja", period: "September 2026", subtitle: "Ikhtisar performa bisnis dan pencapaian utama bulan ini.", summary: "Kinerja bulan ini menunjukkan pertumbuhan yang stabil di seluruh lini bisnis. Fokus utama kami adalah meningkatkan efisiensi tim dan menjaga kualitas layanan." }, metrics: { revenue: "Rp 284,5 jt", projects: "24", satisfaction: "98%" }, highlights: { first: { title: "Pertumbuhan yang konsisten", detail: "Pendapatan meningkat seiring perluasan portofolio klien dan penyelesaian proyek utama." }, second: { title: "Kualitas layanan terjaga", detail: "Umpan balik positif klien menjadi dasar peningkatan proses kerja berikutnya." } } }, null, 2),
  },
];
