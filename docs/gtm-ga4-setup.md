# Setup GTM + GA4 (step by step)

Panduan konfigurasi di sisi Google Tag Manager dan GA4 untuk event di `docs/tracking-plan.md`.
Kode website sudah mengirim semua event ke `dataLayer`. Langkah di bawah ini yang meneruskannya ke GA4.

---

## Bagian A — GA4 (buat property dulu)

1. **Buat property.** Buka analytics.google.com → Admin → *Create* → *Property*. Timezone: Asia/Jakarta, currency: IDR.
2. **Buat data stream.** Admin → *Data streams* → *Add stream* → *Web* → URL `faiznfi.github.io`.
   Salin **Measurement ID** (`G-XXXXXXXXXX`).
3. **Enhanced measurement** (ikon gear di data stream):
   - ✅ Page views, Scrolls, Outbound clicks
   - ⛔ Matikan *Page changes based on browser history events* (di dalam Page views → Show advanced settings).
     Navigasi situs ini hanya pindah anchor (`#projects`). Kalau opsi ini aktif, kemungkinan setiap klik menu
     tercatat sebagai page view palsu. Perpindahan section sudah ditangani `section_view`.
   - ⛔ Form interactions, Site search, Video engagement: situs ini tidak punya form, search, atau video.
4. **Data retention.** Admin → *Data collection and modification* → *Data retention* → **14 months**.
   Default-nya hanya 2 bulan.

## Bagian B — GTM

Buka tagmanager.google.com → container `GTM-TFV5BSX`.

### B1. Variables (Data Layer Variable)

*Variables* → *User-Defined Variables* → *New* → **Data Layer Variable** (Version 2).
Buat 13 variable berikut (nama bebas, saran: prefix `DLV - `):

| Nama variable | Data Layer Variable Name |
|---|---|
| DLV - section_name | `event_params.section_name` |
| DLV - link_text | `event_params.link_text` |
| DLV - link_url | `event_params.link_url` |
| DLV - click_location | `event_params.click_location` |
| DLV - method | `event_params.method` |
| DLV - platform | `event_params.platform` |
| DLV - company | `event_params.company` |
| DLV - role | `event_params.role` |
| DLV - position | `event_params.position` |
| DLV - metric_name | `event_params.metric_name` |
| DLV - metric_value | `event_params.metric_value` |
| DLV - metric_rating | `event_params.metric_rating` |
| DLV - metric_id | `event_params.metric_id` |

Opsional tapi rapi: buat juga **Constant** variable `CONST - GA4 Measurement ID` = `G-XXXXXXXXXX`.

### B2. Trigger

*Triggers* → *New* → **Custom Event**
- Nama: `CE - Site events`
- Event name: centang **Use regex matching**, isi:
  ```
  ^(section_view|cta_click|navigation_click|menu_open|generate_lead|social_click|experience_view|web_vitals|view_item_list|select_item)$
  ```
- This trigger fires on: All Custom Events

### B3. Tag: Google Tag (base GA4)

*Tags* → *New* → **Google Tag**
- Tag ID: `{{CONST - GA4 Measurement ID}}` (atau langsung `G-XXXXXXXXXX`)
- Trigger: **Initialization - All Pages**
- Nama: `Google Tag - GA4`

Tag ini sudah otomatis mengirim `page_view`.

### B4. Tag: GA4 Event (satu tag untuk semua event)

*Tags* → *New* → **Google Analytics: GA4 Event**
- Measurement ID: `{{CONST - GA4 Measurement ID}}`
- Event Name: `{{Event}}` (built-in variable)
- **Event Parameters**: tambahkan 13 baris. Nama parameter sama dengan nama di DLV:
  `section_name` → `{{DLV - section_name}}`, `link_text` → `{{DLV - link_text}}`, dst.
  Parameter yang kosong (`undefined`) tidak akan terkirim, jadi aman dipakai untuk semua event.
- **More Settings → Ecommerce**: centang **Send Ecommerce data**, Data source: **Data Layer**.
  Ini yang mengirim `items[]` untuk `view_item_list` dan `select_item`.
- Trigger: `CE - Site events`
- Nama: `GA4 Event - dataLayer events`

### B5. Test & publish

1. Klik **Preview** lalu masukkan `https://faiznfi.github.io` (setelah PR ini di-merge dan ter-deploy).
2. Klik-klik di situs, lalu cek di Tag Assistant: setiap event harus memicu `GA4 Event - dataLayer events`.
   Di tab *Variables*, pastikan nilai DLV sesuai, dan event sebelumnya tidak ikut terbawa.
3. Buka GA4 → Admin → **DebugView**. Event masuk secara real-time selama Preview aktif.
4. Kalau sudah sesuai: **Submit** → beri nama versi, misalnya `v1 - GA4 base + 10 custom events`.

## Bagian C — GA4 setelah data masuk

1. **Custom definitions.** Admin → *Custom definitions* → *Create custom dimension* (scope: Event):
   `section_name`, `click_location`, `platform`, `company`, `role`, `position`, `metric_name`, `metric_rating`.
   Tab *Custom metrics*: `metric_value` (unit: Standard).
   Jangan daftarkan `link_text`, `link_url` dan `method` karena sudah jadi dimensi bawaan GA4.
   Jangan daftarkan `metric_id` karena nilai uniknya terlalu banyak; cukup dipakai di BigQuery.
2. **Key events.** Admin → *Key events* → *New key event* → `generate_lead`, lalu ulangi untuk `social_click`.
3. **Exclude traffic sendiri:**
   - Admin → Data streams → stream kamu → *Configure tag settings* → *Define internal traffic* → masukkan IP kamu.
   - Admin → *Data filters* → *Internal Traffic* → ubah dari *Testing* ke **Active**.
   - Filter *Developer Traffic* juga aktifkan, supaya hit dari GTM Preview tidak masuk laporan.
4. **BigQuery export.** Admin → *Product links* → **BigQuery Links** → pilih project GCP → *Daily* export.
   Export ini gratis. Kalau GCP project-nya pakai BigQuery Sandbox (tanpa billing), tabel otomatis
   terhapus setelah 60 hari.
5. **Laporan yang berguna** (Explore):
   - Funnel: `page_view` → `section_view (projects)` → `select_item` → `generate_lead`
   - Item list CTR: Monetization → *Ecommerce purchases*, atau Explore dengan dimensi *Item name*
     dan metrik *Items viewed in list* vs *Items clicked in list*
   - Web Vitals: Explore, dimensi `metric_name` + `metric_rating`, metrik *Event count*

## Bagian D — UTM

Pasang link ber-UTM di LinkedIn, GitHub README, CV dan signature email (lihat tabel di
`docs/tracking-plan.md`). Hasilnya terlihat di Reports → Acquisition → *Traffic acquisition*
(dimensi *Session source / medium*).
