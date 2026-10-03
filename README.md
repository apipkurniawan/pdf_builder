# Papercraft PDF Builder

Editor template dokumen berbasis Next.js. Template diekspor sebagai satu file HTML dengan CSS di dalam tag `<style>` dan atribut Thymeleaf tetap utuh.

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Cara pakai

1. Pilih contoh **Invoice Modern**, **Surat Resmi**, atau **Laporan Ringkas**.
2. Edit markup pada tab **HTML** dan gaya pada tab **CSS**. Gunakan atribut seperti `th:text="${invoice.number}"` dan `th:each="item : ${items}"` pada markup.
3. Ubah **Data Contoh** (JSON) untuk melihat hasil dengan nilai nyata. Data ini hanya untuk pratinjau dan tidak ikut diekspor.
4. Klik **Ekspor Template** untuk mengunduh file `.html` yang siap diletakkan di `src/main/resources/templates` pada proyek Spring Boot/Thymeleaf.
5. Klik **Preview PDF** untuk membuka dialog cetak browser dan pilih **Save as PDF**.

Pratinjau lokal mendukung `th:text`, `th:each` sederhana, dan ekspresi inline `[[${...}]]` dengan path properti biasa. Thymeleaf di aplikasi Spring tetap menjadi sumber evaluasi akhir untuk ekspresi yang lebih kompleks.

## Pemeriksaan

```bash
npm run lint
npm run build
```
