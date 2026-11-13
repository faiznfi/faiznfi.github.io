import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "../lib/analytics";
import {
  collectArrival,
  collectAsync,
  collectStatic,
  distanceKm,
  lookupIp,
  readCookies,
  requestPreciseLocation,
  type AsyncInfo,
  type IpInfo,
  type PreciseLocation,
} from "./collectors";
import { computeFingerprint, type Fingerprint } from "./fingerprint";
import { buildProfile } from "./profile";
import { useBehavior } from "./useBehavior";
import { TypingDemo } from "./TypingDemo";
import { Reveal } from "./Reveal";
import { ScreenShareDemo } from "./ScreenShareDemo";
import { Clickjacking } from "./Clickjacking";
import { AutofillDemo } from "./AutofillDemo";
import { ClipboardDemo } from "./ClipboardDemo";
import { Tabnabbing } from "./Tabnabbing";
import { FakeWindow } from "./FakeWindow";
import { PhotoMetadata } from "./PhotoMetadata";
import { useScreenShare } from "./useScreenShare";
import { useCamera } from "./useCamera";
import { Button, Card, Insight, Notice, Row, Rows, Section, Stat } from "./ui";
import { LangGate, LangToggle, useCopy, useLang } from "./i18n";

type Status = "idle" | "loading" | "done" | "error";

const fmtGb = (gb?: number) => (gb === undefined ? undefined : gb >= 1 ? `${gb.toFixed(1)} GB` : `${Math.round(gb * 1024)} MB`);

const COPY_EN = {
  back: "← faiznfi.github.io",
  observingPre: "observing you for",
  observingUnit: "s",
  h1a: "You didn't tell me anything.",
  h1b: "I know this anyway.",
  introP:
    'Any website you open can read everything on this page. Many do, and send it to analytics, advertising and "customer data" platforms. This page does the same reading, then shows you the result instead of sending it away.',
  storedLabel: "Nothing is stored.",
  storedBody:
    "Everything below, including your camera, is computed in your browser and disappears when you close the tab. There are two exceptions, and both are shown openly: this site runs Google Analytics, which records an anonymous page view and which demo buttons you press, and the IP lookup button sends your IP to a geo-IP service, only if you press it.",
  profileTitle: "Your profile, as a data broker would write it",

  loc: {
    title: "Where you are",
    lead: "Your location leaks three ways: your clock settings (free, silent), your IP address (silent for the website), and GPS (needs your permission).",
    tzTitle: "1 · Timezone (silent)",
    timezone: "Timezone",
    utcOffset: "UTC offset",
    locale: "Locale",
    localTime: "Local time",
    ipTitle: "2 · IP address",
    city: "City",
    region: "Region",
    country: "Country",
    postal: "Postal code",
    isp: "ISP / org",
    approxCoords: "Approx. coordinates",
    ipExplain:
      "Every server you connect to sees your IP; it's how the internet routes the reply. A website's server logs it automatically. This static page has no server of its own, so to show it, your IP has to be sent to a geo-IP service.",
    ipLoading: "Looking up…",
    ipAgain: "Look up again",
    ipGo: "Look up my IP",
    via: "via",
    gpsTitle: "3 · GPS (asks permission)",
    latitude: "Latitude",
    longitude: "Longitude",
    accuracy: "Accuracy",
    altitude: "Altitude",
    distFromIp: "Distance from IP guess",
    gpsExplain:
      'The browser will ask before sharing this. Many people click "Allow" without reading, often because a store locator or delivery app asked first.',
    gpsLoading: "Waiting for you…",
    gpsGo: "Share precise location",
    openMap: "Open on map ↗",
    insight:
      "Location data is a pattern, not one point. Where your phone sleeps is your home; where it spends 9 to 5 is your workplace. Data brokers sell exactly this, built from apps that asked for location once.",
  },

  dev: {
    title: "Your device",
    lead: "Your browser describes your hardware in detail. No prompt and no permission.",
    systemTitle: "System",
    deviceType: "Device type",
    phone: "Phone / tablet",
    desktop: "Desktop / laptop",
    os: "Operating system",
    platformVersion: "platform version",
    model: "Device model",
    modelHint: "Exposed by Chromium on Android",
    cpuArch: "CPU architecture",
    cpuCores: "CPU cores",
    ram: "RAM (rounded)",
    gpuVendor: "GPU vendor",
    gpuModel: "GPU model",
    storage: "Storage quota",
    storageHint: "Often proportional to free disk space; very small in private windows",
    screenTitle: "Screen, power & peripherals",
    screen: "Screen",
    usableScreen: "Usable screen",
    usableScreenHint: "The difference reveals taskbar / dock size",
    browserWindow: "Browser window",
    pixelRatio: "Pixel ratio",
    colorDepth: "Colour depth",
    orientation: "Orientation",
    touchPoints: "Touch points",
    mouseTrackpad: "Mouse / trackpad",
    battery: "Battery",
    charging: "charging",
    onBattery: "on battery",
    devices: "Cameras / mics / speakers",
    devicesHint: "Counted without asking; names need permission",
    insight:
      "Hardware is a price signal. Booking and e-commerce sites have been caught showing different prices or products to visitors on expensive devices. It's also a fingerprinting ingredient (see section 05).",
  },

  br: {
    title: "Your browser & habits",
    lead: "Settings you chose once quietly describe who you are: which languages you read, whether you use dark mode, whether you need accessibility features.",
    browserTitle: "Browser",
    browser: "Browser",
    inAppBrowser: "In-app browser",
    no: "No",
    fullVersions: "Full versions",
    userAgent: "User agent",
    webdriver: "Automated (webdriver)",
    webdriverHint: "Bots and test tools often say yes",
    cookiesEnabled: "Cookies enabled",
    pdfViewer: "Built-in PDF viewer",
    prefsTitle: "Preferences & signals",
    languages: "Languages",
    darkMode: "Dark mode",
    reducedMotion: "Reduced motion",
    highContrast: "High contrast",
    a11yHint: "An accessibility setting",
    forcedColors: "Forced colours",
    network: "Network",
    dataSaver: "Data saver",
    dnt: "Do Not Track",
    dntHint: "A request. Sites can and do ignore it",
    gpc: "Global Privacy Control",
    gpcHint: "Legally binding in some US states",
    permsTitle: "Permissions you've already given this site",
    permsNote: "A site can check these without showing a prompt.",
    insight:
      "Accessibility settings (reduced motion, high contrast, forced colours) can hint at a disability, which is sensitive personal data under most privacy laws, including Indonesia's UU PDP.",
  },

  arr: {
    title: "How you got here, and whether I remember you",
    lead: "The link you clicked carries information, and cookies let a site recognise you on your next visit.",
    arrivalTitle: "Arrival",
    referrer: "Referrer",
    referrerHint: "The page you came from",
    clidHint: "Ad click ID: ties this visit to a specific ad click",
    navType: "Navigation type",
    navTypeHint: "navigate · reload · back_forward",
    historyLen: "Pages in this tab's history",
    protocol: "Network protocol",
    timing: "DNS / connect / first byte",
    cookiesTitle: "Cookies on this site",
    cookiesPresent: "Cookies present",
    noneYet: "none yet",
    gaId: "Google Analytics ID",
    gaIdHint: "Random, but follows you on every visit until you clear cookies",
    firstVisit: "First visit",
    firstVisitHint: "Encoded inside the _ga cookie",
    visitNumber: "Visit number",
    sessionStarted: "This session started",
    lsKeys: "localStorage keys",
    none: "none",
    insight:
      "UTM tags and ad click IDs (gclid, fbclid, ttclid) in a link tell a site which campaign, post or person sent you. The _ga cookie turns separate visits into one history. Third-party cookies used to do the same across different websites.",
  },

  fp: {
    title: "Your fingerprint",
    lead: "Small differences in how your device draws graphics, plays audio and which fonts it has add up to an ID that survives clearing cookies and private browsing.",
    fpTitle: "Fingerprint ID",
    computing: "computing…",
    desc: "Reload the page, or open it in a private window: in most browsers this stays the same. Browsers with anti-fingerprinting (Brave, Tor, Firefox with resistFingerprinting, Safari) add noise to it.",
    canvasCaption: "The hidden image used for canvas fingerprinting:",
    ingredientsTitle: "Ingredients",
    detected: (n: number) => `${n} detected`,
    fontsFound: "Installed fonts found: ",
    insight:
      'Fingerprinting needs no cookie, so cookie banners and "clear browsing data" don\'t touch it. Installed fonts can even reveal software you use (Office, Adobe, developer tools) and the languages you write.',
  },

  beh: {
    title: "What you're doing right now",
    lead: "Analytics and session-replay tools record every movement. The cyan line following your cursor is that recording, replayed live. Pink circles are your clicks.",
    secondsOnPage: "Seconds on page",
    secondsLooking: "Seconds actually looking",
    tabVisible: "Tab visible",
    secondsIdle: "Seconds idle",
    sinceInput: "Since your last input",
    tabLeft: "Times you left this tab",
    maxScroll: "Max scroll depth",
    cursorTravel: "Cursor travel",
    clicks: "Clicks",
    rageClicks: "Rage clicks",
    rageHint: "3 fast clicks in one spot",
    keys: "Keys pressed",
    blur: "Window lost focus",
    resizes: "Window resizes",
    copies: "Copies",
    insight:
      "Try selecting and copying any text on this page; it shows up above. Sites use this to see which prices, addresses or code snippets people copy. Session-replay tools rebuild a video of your visit from these events.",
  },

  typing: {
    title: "What you type, before you submit",
    lead: "A form is readable while you're still filling it in.",
  },

  combine: {
    title: "Why combining is the real danger",
    lead: "No single item above identifies you. Together, they do.",
    identifyTitle: "Identify",
    identifyBody:
      "Timezone + language + screen + GPU + fonts is often unique among millions of browsers. If you log in anywhere, that profile gets your name.",
    followTitle: "Follow",
    followBody:
      "The same tracking script (analytics, ad pixels, social buttons) on thousands of sites links your visits into one browsing history.",
    inferTitle: "Infer",
    inferBody:
      "From the history, models infer income, health, religion, relationship status or a job search. Then they sell the segment, not the raw data.",
  },

  protect: {
    title: "How to protect yourself",
    lead: "You can't hide everything. You can make it much harder.",
    tips: [
      ["Use a privacy-focused browser", "Brave, Firefox (strict tracking protection), Safari, or Tor Browser for maximum anonymity. They block trackers and randomise fingerprints."],
      ["Install a content blocker", "uBlock Origin blocks most analytics, ad pixels and session-replay scripts before they load."],
      ["Say no to permissions", 'Deny location, notifications, camera and microphone by default. Grant them per visit, never "always".'],
      ["Hide your IP", "A trustworthy VPN or iCloud Private Relay hides your real IP and location from the sites you visit."],
      ["Strip tracking links", "Remove ?utm_…, fbclid, gclid and similar from links before sharing them. Some browsers do this automatically."],
      ["Separate identities", "Use different browsers or containers for work, shopping and social media, so their profiles don't merge."],
      ["Clear cookies regularly", "Or set your browser to clear them on exit. It won't stop fingerprinting, but it resets ID cookies like _ga."],
      ["Be careful what you type", "Assume anything typed into a web form can be read before you hit submit."],
      ["Strip photo metadata", "Turn off location tagging in your camera app, and remove location before sharing original files. Screenshots carry no GPS."],
    ] as [string, string][],
  },

  footer: "Built for a data-tracking lecture by Faiz Insani · nothing on this page is stored.",

  errLookup: "Lookup failed (an ad blocker may have blocked it)",
  errDeniedLoc: "You said no. Good instinct.",
  errLocUnavailable: "Location unavailable",
};

type Copy = typeof COPY_EN;

const COPY_ID: Copy = {
  back: "← faiznfi.github.io",
  observingPre: "mengamati kamu selama",
  observingUnit: "d",
  h1a: "Kamu tidak memberi tahu apa pun.",
  h1b: "Aku tetap tahu semuanya.",
  introP:
    'Website apa pun yang kamu buka bisa membaca semua yang ada di halaman ini. Banyak yang melakukannya, lalu mengirimnya ke platform analitik, iklan, dan "data pelanggan". Halaman ini membaca hal yang sama, tapi menampilkannya ke kamu, bukan mengirimnya ke mana-mana.',
  storedLabel: "Tidak ada yang disimpan.",
  storedBody:
    "Semua yang ada di bawah, termasuk kamera kamu, diproses di browser kamu dan hilang saat kamu menutup tab. Ada dua pengecualian, dan keduanya ditampilkan terbuka: situs ini memakai Google Analytics, yang mencatat kunjungan halaman secara anonim dan tombol demo mana yang kamu tekan, dan tombol cek IP mengirim IP kamu ke layanan geo-IP, hanya kalau kamu menekannya.",
  profileTitle: "Profil kamu, seperti yang akan ditulis oleh pialang data",

  loc: {
    title: "Di mana kamu berada",
    lead: "Lokasi kamu bocor lewat tiga cara: pengaturan jam (gratis, diam-diam), alamat IP (diam-diam bagi website), dan GPS (butuh izin kamu).",
    tzTitle: "1 · Zona waktu (diam-diam)",
    timezone: "Zona waktu",
    utcOffset: "Offset UTC",
    locale: "Locale",
    localTime: "Waktu lokal",
    ipTitle: "2 · Alamat IP",
    city: "Kota",
    region: "Wilayah",
    country: "Negara",
    postal: "Kode pos",
    isp: "ISP / org",
    approxCoords: "Perkiraan koordinat",
    ipExplain:
      "Setiap server yang kamu hubungi melihat IP kamu; begitulah internet mengirim balasan. Server sebuah website mencatatnya otomatis. Halaman statis ini tidak punya server sendiri, jadi untuk menampilkannya, IP kamu harus dikirim ke layanan geo-IP.",
    ipLoading: "Mencari…",
    ipAgain: "Cek lagi",
    ipGo: "Cek IP saya",
    via: "via",
    gpsTitle: "3 · GPS (minta izin)",
    latitude: "Lintang",
    longitude: "Bujur",
    accuracy: "Akurasi",
    altitude: "Ketinggian",
    distFromIp: "Jarak dari tebakan IP",
    gpsExplain:
      'Browser akan bertanya sebelum membagikan ini. Banyak orang klik "Izinkan" tanpa membaca, sering karena aplikasi pencari toko atau pengiriman bertanya lebih dulu.',
    gpsLoading: "Menunggu kamu…",
    gpsGo: "Bagikan lokasi presisi",
    openMap: "Buka di peta ↗",
    insight:
      "Data lokasi adalah pola, bukan satu titik. Tempat HP kamu tidur adalah rumahmu; tempatnya berada dari jam 9 sampai 5 adalah kantormu. Pialang data menjual persis ini, dibangun dari aplikasi yang pernah sekali meminta lokasi.",
  },

  dev: {
    title: "Perangkat kamu",
    lead: "Browser kamu menjelaskan perangkat keras kamu secara detail. Tanpa prompt dan tanpa izin.",
    systemTitle: "Sistem",
    deviceType: "Jenis perangkat",
    phone: "HP / tablet",
    desktop: "Desktop / laptop",
    os: "Sistem operasi",
    platformVersion: "versi platform",
    model: "Model perangkat",
    modelHint: "Dibocorkan oleh Chromium di Android",
    cpuArch: "Arsitektur CPU",
    cpuCores: "Inti CPU",
    ram: "RAM (dibulatkan)",
    gpuVendor: "Vendor GPU",
    gpuModel: "Model GPU",
    storage: "Kuota penyimpanan",
    storageHint: "Sering sebanding dengan ruang disk kosong; sangat kecil di mode penyamaran",
    screenTitle: "Layar, daya & periferal",
    screen: "Layar",
    usableScreen: "Layar terpakai",
    usableScreenHint: "Selisihnya mengungkap ukuran taskbar / dock",
    browserWindow: "Jendela browser",
    pixelRatio: "Rasio piksel",
    colorDepth: "Kedalaman warna",
    orientation: "Orientasi",
    touchPoints: "Titik sentuh",
    mouseTrackpad: "Mouse / trackpad",
    battery: "Baterai",
    charging: "mengisi",
    onBattery: "pakai baterai",
    devices: "Kamera / mik / speaker",
    devicesHint: "Dihitung tanpa bertanya; namanya butuh izin",
    insight:
      "Perangkat keras adalah sinyal harga. Situs pemesanan dan e-commerce pernah ketahuan menampilkan harga atau produk berbeda kepada pengunjung dengan perangkat mahal. Ini juga bahan fingerprinting (lihat bagian 05).",
  },

  br: {
    title: "Browser & kebiasaan kamu",
    lead: "Pengaturan yang kamu pilih sekali diam-diam menggambarkan siapa kamu: bahasa apa yang kamu baca, apakah kamu memakai mode gelap, apakah kamu butuh fitur aksesibilitas.",
    browserTitle: "Browser",
    browser: "Browser",
    inAppBrowser: "Browser dalam aplikasi",
    no: "Tidak",
    fullVersions: "Versi lengkap",
    userAgent: "User agent",
    webdriver: "Otomatis (webdriver)",
    webdriverHint: "Bot dan alat uji sering bernilai ya",
    cookiesEnabled: "Cookie aktif",
    pdfViewer: "Pembaca PDF bawaan",
    prefsTitle: "Preferensi & sinyal",
    languages: "Bahasa",
    darkMode: "Mode gelap",
    reducedMotion: "Kurangi animasi",
    highContrast: "Kontras tinggi",
    a11yHint: "Pengaturan aksesibilitas",
    forcedColors: "Warna paksa",
    network: "Jaringan",
    dataSaver: "Hemat data",
    dnt: "Do Not Track",
    dntHint: "Sekadar permintaan. Situs bisa dan biasa mengabaikannya",
    gpc: "Global Privacy Control",
    gpcHint: "Mengikat secara hukum di beberapa negara bagian AS",
    permsTitle: "Izin yang sudah kamu berikan ke situs ini",
    permsNote: "Situs bisa memeriksa ini tanpa menampilkan prompt.",
    insight:
      "Pengaturan aksesibilitas (kurangi animasi, kontras tinggi, warna paksa) bisa mengisyaratkan disabilitas, yang merupakan data pribadi sensitif menurut sebagian besar hukum privasi, termasuk UU PDP Indonesia.",
  },

  arr: {
    title: "Bagaimana kamu sampai di sini, dan apakah aku mengingatmu",
    lead: "Tautan yang kamu klik membawa informasi, dan cookie membuat situs mengenalimu saat kunjungan berikutnya.",
    arrivalTitle: "Kedatangan",
    referrer: "Referrer",
    referrerHint: "Halaman asal kamu",
    clidHint: "ID klik iklan: mengaitkan kunjungan ini ke klik iklan tertentu",
    navType: "Jenis navigasi",
    navTypeHint: "navigate · reload · back_forward",
    historyLen: "Halaman di riwayat tab ini",
    protocol: "Protokol jaringan",
    timing: "DNS / koneksi / byte pertama",
    cookiesTitle: "Cookie di situs ini",
    cookiesPresent: "Cookie yang ada",
    noneYet: "belum ada",
    gaId: "ID Google Analytics",
    gaIdHint: "Acak, tapi mengikutimu setiap kunjungan sampai kamu hapus cookie",
    firstVisit: "Kunjungan pertama",
    firstVisitHint: "Tersimpan di dalam cookie _ga",
    visitNumber: "Kunjungan ke-",
    sessionStarted: "Sesi ini dimulai",
    lsKeys: "Kunci localStorage",
    none: "tidak ada",
    insight:
      "Tag UTM dan ID klik iklan (gclid, fbclid, ttclid) di sebuah tautan memberi tahu situs kampanye, unggahan, atau orang mana yang mengirimmu. Cookie _ga mengubah kunjungan-kunjungan terpisah menjadi satu riwayat. Cookie pihak ketiga dulu melakukan hal yang sama lintas website berbeda.",
  },

  fp: {
    title: "Sidik jari kamu",
    lead: "Perbedaan kecil dalam cara perangkatmu menggambar grafik, memutar audio, dan font yang dimilikinya membentuk sebuah ID yang bertahan meski cookie dihapus dan memakai mode penyamaran.",
    fpTitle: "ID sidik jari",
    computing: "menghitung…",
    desc: "Muat ulang halaman, atau buka di jendela penyamaran: di sebagian besar browser nilainya tetap sama. Browser dengan anti-fingerprinting (Brave, Tor, Firefox dengan resistFingerprinting, Safari) menambahkan gangguan padanya.",
    canvasCaption: "Gambar tersembunyi yang dipakai untuk canvas fingerprinting:",
    ingredientsTitle: "Bahan-bahan",
    detected: (n: number) => `${n} terdeteksi`,
    fontsFound: "Font terpasang yang ditemukan: ",
    insight:
      'Fingerprinting tidak butuh cookie, jadi banner cookie dan "hapus data penjelajahan" tidak menyentuhnya. Font terpasang bahkan bisa mengungkap software yang kamu pakai (Office, Adobe, alat developer) dan bahasa yang kamu tulis.',
  },

  beh: {
    title: "Yang sedang kamu lakukan sekarang",
    lead: "Alat analitik dan session-replay merekam setiap gerakan. Garis biru yang mengikuti kursor kamu adalah rekaman itu, diputar langsung. Lingkaran merah muda adalah klik kamu.",
    secondsOnPage: "Detik di halaman",
    secondsLooking: "Detik benar-benar melihat",
    tabVisible: "Tab terlihat",
    secondsIdle: "Detik menganggur",
    sinceInput: "Sejak input terakhir kamu",
    tabLeft: "Berapa kali kamu meninggalkan tab ini",
    maxScroll: "Kedalaman scroll maks",
    cursorTravel: "Jarak tempuh kursor",
    clicks: "Klik",
    rageClicks: "Klik frustrasi",
    rageHint: "3 klik cepat di satu titik",
    keys: "Tombol ditekan",
    blur: "Jendela kehilangan fokus",
    resizes: "Ubah ukuran jendela",
    copies: "Salinan",
    insight:
      "Coba seleksi dan salin teks apa pun di halaman ini; teksnya muncul di atas. Situs memakai ini untuk melihat harga, alamat, atau potongan kode mana yang orang salin. Alat session-replay menyusun ulang video kunjunganmu dari peristiwa-peristiwa ini.",
  },

  typing: {
    title: "Yang kamu ketik, sebelum kamu kirim",
    lead: "Formulir bisa dibaca saat kamu masih mengisinya.",
  },

  combine: {
    title: "Kenapa penggabungan adalah bahaya sebenarnya",
    lead: "Tidak ada satu pun item di atas yang mengidentifikasi kamu sendirian. Tapi digabung, bisa.",
    identifyTitle: "Mengidentifikasi",
    identifyBody:
      "Zona waktu + bahasa + layar + GPU + font sering unik di antara jutaan browser. Kalau kamu login di mana pun, profil itu mendapat namamu.",
    followTitle: "Mengikuti",
    followBody:
      "Skrip pelacak yang sama (analitik, piksel iklan, tombol media sosial) di ribuan situs menautkan kunjunganmu menjadi satu riwayat penjelajahan.",
    inferTitle: "Menyimpulkan",
    inferBody:
      "Dari riwayat itu, model menyimpulkan penghasilan, kesehatan, agama, status hubungan, atau pencarian kerja. Lalu mereka menjual segmennya, bukan data mentahnya.",
  },

  protect: {
    title: "Cara melindungi diri",
    lead: "Kamu tidak bisa menyembunyikan semuanya. Tapi kamu bisa membuatnya jauh lebih sulit.",
    tips: [
      ["Pakai browser yang fokus privasi", "Brave, Firefox (proteksi pelacakan ketat), Safari, atau Tor Browser untuk anonimitas maksimal. Mereka memblokir pelacak dan mengacak fingerprint."],
      ["Pasang pemblokir konten", "uBlock Origin memblokir sebagian besar skrip analitik, piksel iklan, dan session-replay sebelum sempat dimuat."],
      ["Tolak permintaan izin", 'Tolak lokasi, notifikasi, kamera, dan mikrofon secara default. Berikan per kunjungan, jangan pernah "selalu".'],
      ["Sembunyikan IP kamu", "VPN tepercaya atau iCloud Private Relay menyembunyikan IP dan lokasi aslimu dari situs yang kamu kunjungi."],
      ["Bersihkan tautan pelacak", "Hapus ?utm_…, fbclid, gclid, dan sejenisnya dari tautan sebelum membagikannya. Beberapa browser melakukannya otomatis."],
      ["Pisahkan identitas", "Pakai browser atau container berbeda untuk kerja, belanja, dan media sosial, supaya profilnya tidak menyatu."],
      ["Hapus cookie secara berkala", "Atau atur browser untuk menghapusnya saat keluar. Ini tidak menghentikan fingerprinting, tapi mereset cookie ID seperti _ga."],
      ["Hati-hati dengan yang kamu ketik", "Anggap apa pun yang diketik ke formulir web bisa dibaca sebelum kamu menekan kirim."],
      ["Hapus metadata foto", "Matikan penanda lokasi di aplikasi kamera, dan hapus lokasi sebelum membagikan file asli. Screenshot tidak membawa GPS."],
    ],
  },

  footer: "Dibuat untuk kuliah data tracking oleh Faiz Insani · tidak ada data di halaman ini yang disimpan.",

  errLookup: "Pencarian gagal (mungkin diblokir oleh ad blocker)",
  errDeniedLoc: "Kamu bilang tidak. Insting yang bagus.",
  errLocUnavailable: "Lokasi tidak tersedia",
};

const COPY = { en: COPY_EN, id: COPY_ID };

export function WhoAmI() {
  const { lang } = useLang();
  const t = useCopy(COPY);
  const dateLocale = lang === "id" ? "id-ID" : "en-GB";
  const fmtDate = (d?: Date) => d?.toLocaleString(dateLocale, { dateStyle: "medium", timeStyle: "short" });

  const info = useMemo(collectStatic, []);
  const arrival = useMemo(collectArrival, []);
  const [cookies, setCookies] = useState(readCookies);
  const [extra, setExtra] = useState<AsyncInfo>();
  const [fingerprint, setFingerprint] = useState<Fingerprint>();

  const [ip, setIp] = useState<IpInfo>();
  const [ipStatus, setIpStatus] = useState<Status>("idle");
  const [ipError, setIpError] = useState<string>();
  const [precise, setPrecise] = useState<PreciseLocation>();
  const [preciseStatus, setPreciseStatus] = useState<Status>("idle");
  const [preciseError, setPreciseError] = useState<string>();

  const camera = useCamera();
  const screen = useScreenShare();
  const [started, setStarted] = useState(false);
  const autoAsked = useRef(false);

  const trailCanvas = useRef<HTMLCanvasElement>(null);
  const behavior = useBehavior(trailCanvas);

  useEffect(() => {
    collectAsync().then(setExtra);
    computeFingerprint(info).then(setFingerprint);
    // GA cookies are created asynchronously by GTM; read them again shortly after load.
    const id = window.setTimeout(() => setCookies(readCookies()), 2500);
    return () => clearTimeout(id);
  }, [info]);

  // Ask for location, then the camera, once the visitor has chosen a language,
  // with no further explanation. How people react to unexplained prompts is the lesson.
  useEffect(() => {
    if (!started || autoAsked.current) return;
    autoAsked.current = true;
    (async () => {
      await onPreciseLocation();
      await onCamera();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  const profile = buildProfile(
    {
      info,
      extra,
      arrival,
      cookies,
      ip,
      precise,
      behavior,
      fingerprintId: fingerprint?.id,
      cameraOn: camera.status === "on",
    },
    lang,
  );

  async function onLookupIp() {
    setIpStatus("loading");
    setIpError(undefined);
    try {
      setIp(await lookupIp());
      setIpStatus("done");
      track("whoami_action", { demo_action: "ip_lookup", demo_result: "success" });
    } catch (error) {
      setIpStatus("error");
      setIpError(error instanceof Error ? error.message : t.errLookup);
      track("whoami_action", { demo_action: "ip_lookup", demo_result: "error" });
    }
  }

  async function onPreciseLocation() {
    setPreciseStatus("loading");
    setPreciseError(undefined);
    try {
      setPrecise(await requestPreciseLocation());
      setPreciseStatus("done");
      track("whoami_action", { demo_action: "precise_location", demo_result: "granted" });
    } catch (error) {
      setPreciseStatus("error");
      const denied = error instanceof GeolocationPositionError && error.code === error.PERMISSION_DENIED;
      setPreciseError(denied ? t.errDeniedLoc : error instanceof Error ? error.message : t.errLocUnavailable);
      track("whoami_action", { demo_action: "precise_location", demo_result: denied ? "denied" : "error" });
    }
    collectAsync().then(setExtra); // refresh permission states
  }

  async function onCamera() {
    const result = await camera.start();
    track("whoami_action", {
      demo_action: "camera",
      demo_result: result === "on" ? "granted" : result === "denied" ? "denied" : "error",
    });
    collectAsync().then(setExtra);
  }

  async function onScreenShare() {
    const result = await screen.start();
    track("whoami_action", {
      demo_action: "screen_share",
      demo_result: result === "on" ? "granted" : result === "denied" ? "denied" : "error",
    });
  }

  const he = extra?.highEntropy;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E0E0E6] font-sans selection:bg-cyan-500/30">
      <LangGate onChosen={() => setStarted(true)} />

      {/* Live cursor trail covers the whole viewport, behind the content. */}
      <canvas ref={trailCanvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />

      <div className="relative z-10 container mx-auto max-w-5xl px-6">
        <header className="flex items-center justify-between py-6 font-mono text-xs">
          <a href="/" className="text-white/50 hover:text-cyan-400 transition-colors">
            {t.back}
          </a>
          <div className="flex items-center gap-4">
            <span className="text-white/40 tabular-nums">
              {t.observingPre} <span className="text-cyan-400">{Math.floor(behavior.secondsOnPage)}{t.observingUnit}</span>
            </span>
            <LangToggle />
          </div>
        </header>

        {/* Intro */}
        <div className="pt-12 pb-16">
          <span className="font-mono text-cyan-500 text-xs">$ whoami</span>
          <h1 className="mt-4 text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
            {t.h1a}
            <br />
            <span className="text-white/40 italic font-light">{t.h1b}</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-white/70 leading-relaxed">{t.introP}</p>
          <div className="mt-8 max-w-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-200/90 leading-relaxed">
            <strong className="font-mono text-xs uppercase tracking-widest text-emerald-400">{t.storedLabel}</strong>{" "}
            {t.storedBody}
          </div>
        </div>

        <Reveal
          camera={{ ...camera, start: onCamera }}
          location={{ value: precise, status: preciseStatus, error: preciseError, retry: onPreciseLocation }}
        />

        {/* 00 — Profile */}
        <section aria-labelledby="profile-title" className="pb-16">
          <Card className="border-cyan-500/20">
            <h2 id="profile-title" className="font-mono text-[11px] uppercase tracking-widest text-cyan-400 mb-4">
              [00] {t.profileTitle}
            </h2>
            <ul className="space-y-3">
              {profile.map((line) => (
                <li key={line.slice(0, 40)} className="flex gap-3 text-[15px] leading-relaxed text-white/85">
                  <span aria-hidden="true" className="text-cyan-500">▹</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* 01 — Location */}
        <Section id="location" index="01" title={t.loc.title} lead={t.loc.lead}>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card title={t.loc.tzTitle}>
              <Rows>
                <Row label={t.loc.timezone} value={info.timeZone} />
                <Row label={t.loc.utcOffset} value={`UTC${info.utcOffset >= 0 ? "+" : ""}${info.utcOffset}`} />
                <Row label={t.loc.locale} value={info.locale} />
                <Row label={t.loc.localTime} value={new Date().toLocaleTimeString(dateLocale)} />
              </Rows>
            </Card>

            <Card title={t.loc.ipTitle}>
              {ip ? (
                <Rows>
                  <Row label="IP" value={ip.ip} />
                  <Row label={t.loc.city} value={ip.city} />
                  <Row label={t.loc.region} value={ip.region} />
                  <Row label={t.loc.country} value={ip.country} />
                  <Row label={t.loc.postal} value={ip.postal} />
                  <Row label={t.loc.isp} value={ip.org} hint={ip.asn} />
                  <Row label={t.loc.approxCoords} value={ip.latitude && `${ip.latitude}, ${ip.longitude}`} />
                </Rows>
              ) : (
                <p className="text-sm text-white/60 leading-relaxed">{t.loc.ipExplain}</p>
              )}
              <div className="mt-4">
                <Button onClick={onLookupIp} disabled={ipStatus === "loading"}>
                  {ipStatus === "loading" ? t.loc.ipLoading : ip ? t.loc.ipAgain : t.loc.ipGo}
                </Button>
              </div>
              {ip && <p className="mt-2 text-[11px] text-white/35">{t.loc.via} {ip.source}</p>}
              {ipError && <Notice>{ipError}</Notice>}
            </Card>

            <Card title={t.loc.gpsTitle}>
              {precise ? (
                <Rows>
                  <Row label={t.loc.latitude} value={precise.latitude.toFixed(6)} />
                  <Row label={t.loc.longitude} value={precise.longitude.toFixed(6)} />
                  <Row label={t.loc.accuracy} value={`± ${precise.accuracyM} m`} />
                  <Row label={t.loc.altitude} value={precise.altitude && `${Math.round(precise.altitude)} m`} />
                  <Row
                    label={t.loc.distFromIp}
                    value={
                      ip?.latitude !== undefined && ip.longitude !== undefined
                        ? `${distanceKm(precise, { latitude: ip.latitude, longitude: ip.longitude }).toFixed(1)} km`
                        : undefined
                    }
                  />
                </Rows>
              ) : (
                <p className="text-sm text-white/60 leading-relaxed">{t.loc.gpsExplain}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={onPreciseLocation} disabled={preciseStatus === "loading"}>
                  {preciseStatus === "loading" ? t.loc.gpsLoading : t.loc.gpsGo}
                </Button>
                {precise && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${precise.latitude}&mlon=${precise.longitude}#map=18/${precise.latitude}/${precise.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-cyan-400 underline underline-offset-4"
                  >
                    {t.loc.openMap}
                  </a>
                )}
              </div>
              {preciseError && <Notice>{preciseError}</Notice>}
            </Card>
          </div>
          <Insight>{t.loc.insight}</Insight>
        </Section>

        {/* 02 — Device */}
        <Section id="device" index="02" title={t.dev.title} lead={t.dev.lead}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title={t.dev.systemTitle}>
              <Rows>
                <Row label={t.dev.deviceType} value={info.mobile ? t.dev.phone : t.dev.desktop} />
                <Row label={t.dev.os} value={info.os} hint={he?.platformVersion && `${t.dev.platformVersion} ${he.platformVersion}`} />
                <Row label={t.dev.model} value={he?.model} hint={t.dev.modelHint} />
                <Row label={t.dev.cpuArch} value={he?.architecture && `${he.architecture} ${he.bitness ?? ""}-bit`} />
                <Row label={t.dev.cpuCores} value={info.cores} />
                <Row label={t.dev.ram} value={info.memoryGb && `≥ ${info.memoryGb} GB`} />
                <Row label={t.dev.gpuVendor} value={info.gpuVendor} />
                <Row label={t.dev.gpuModel} value={info.gpuRenderer} />
                <Row label={t.dev.storage} value={fmtGb(extra?.storageQuotaGb)} hint={t.dev.storageHint} />
              </Rows>
            </Card>
            <Card title={t.dev.screenTitle}>
              <Rows>
                <Row label={t.dev.screen} value={info.screen} />
                <Row label={t.dev.usableScreen} value={info.availScreen} hint={t.dev.usableScreenHint} />
                <Row label={t.dev.browserWindow} value={info.viewport} />
                <Row label={t.dev.pixelRatio} value={`${info.pixelRatio}×`} />
                <Row label={t.dev.colorDepth} value={`${info.colorDepth}-bit`} />
                <Row label={t.dev.orientation} value={info.orientation} />
                <Row label={t.dev.touchPoints} value={info.touchPoints} />
                <Row label={t.dev.mouseTrackpad} value={info.hoverCapable} />
                <Row
                  label={t.dev.battery}
                  value={extra?.battery && `${extra.battery.level}% · ${extra.battery.charging ? t.dev.charging : t.dev.onBattery}`}
                />
                <Row
                  label={t.dev.devices}
                  value={extra?.cameras !== undefined ? `${extra.cameras} / ${extra.microphones} / ${extra.speakers}` : undefined}
                  hint={t.dev.devicesHint}
                />
              </Rows>
            </Card>
          </div>
          <Insight>{t.dev.insight}</Insight>
        </Section>

        {/* 03 — Browser & preferences */}
        <Section id="browser" index="03" title={t.br.title} lead={t.br.lead}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title={t.br.browserTitle}>
              <Rows>
                <Row label={t.br.browser} value={info.browser} />
                <Row label={t.br.inAppBrowser} value={info.inApp ?? t.br.no} />
                <Row label={t.br.fullVersions} value={he?.fullVersionList?.map((b) => `${b.brand} ${b.version}`).join(", ")} />
                <Row label={t.br.userAgent} value={info.ua} />
                <Row label={t.br.webdriver} value={info.webdriver} hint={t.br.webdriverHint} />
                <Row label={t.br.cookiesEnabled} value={info.cookiesEnabled} />
                <Row label={t.br.pdfViewer} value={info.pdfViewer} />
              </Rows>
            </Card>
            <Card title={t.br.prefsTitle}>
              <Rows>
                <Row label={t.br.languages} value={info.languages.join(", ")} />
                <Row label={t.br.darkMode} value={info.darkMode} />
                <Row label={t.br.reducedMotion} value={info.reducedMotion} hint={t.br.a11yHint} />
                <Row label={t.br.highContrast} value={info.highContrast} hint={t.br.a11yHint} />
                <Row label={t.br.forcedColors} value={info.forcedColors} />
                <Row label={t.br.network} value={info.effectiveType && `${info.effectiveType} · ${info.downlinkMbps} Mbps · ${info.rttMs} ms`} />
                <Row label={t.br.dataSaver} value={info.saveData} />
                <Row label={t.br.dnt} value={info.doNotTrack} hint={t.br.dntHint} />
                <Row label={t.br.gpc} value={info.globalPrivacyControl} hint={t.br.gpcHint} />
              </Rows>
            </Card>
            <Card title={t.br.permsTitle} className="lg:col-span-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(extra?.permissions ?? {}).map(([name, state]) => (
                  <div key={name} className="flex items-center justify-between border border-white/5 px-3 py-2 font-mono text-xs">
                    <span className="text-white/60">{name}</span>
                    <span className={state === "granted" ? "text-pink-400" : state === "denied" ? "text-emerald-400" : "text-white/40"}>
                      {state}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/40">{t.br.permsNote}</p>
            </Card>
          </div>
          <Insight>{t.br.insight}</Insight>
        </Section>

        {/* 04 — Arrival & memory */}
        <Section id="arrival" index="04" title={t.arr.title} lead={t.arr.lead}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title={t.arr.arrivalTitle}>
              <Rows>
                <Row label={t.arr.referrer} value={arrival.referrer} hint={t.arr.referrerHint} />
                {Object.entries(arrival.utm).map(([key, value]) => (
                  <Row key={key} label={key} value={value} hint={key.endsWith("clid") ? t.arr.clidHint : undefined} />
                ))}
                <Row label={t.arr.navType} value={arrival.navigationType} hint={t.arr.navTypeHint} />
                <Row label={t.arr.historyLen} value={arrival.historyLength} />
                <Row label={t.arr.protocol} value={arrival.timing?.protocol} />
                <Row label={t.arr.timing} value={arrival.timing && `${arrival.timing.dnsMs} / ${arrival.timing.connectMs} / ${arrival.timing.ttfbMs} ms`} />
              </Rows>
            </Card>
            <Card title={t.arr.cookiesTitle}>
              <Rows>
                <Row label={t.arr.cookiesPresent} value={cookies.names.join(", ") || t.arr.noneYet} />
                <Row label={t.arr.gaId} value={cookies.gaClientId} hint={t.arr.gaIdHint} />
                <Row label={t.arr.firstVisit} value={fmtDate(cookies.firstVisit)} hint={t.arr.firstVisitHint} />
                <Row label={t.arr.visitNumber} value={cookies.sessionCount} />
                <Row label={t.arr.sessionStarted} value={fmtDate(cookies.sessionStart)} />
                <Row label={t.arr.lsKeys} value={cookies.localStorageKeys.join(", ") || t.arr.none} />
              </Rows>
            </Card>
          </div>
          <Insight>{t.arr.insight}</Insight>
        </Section>

        {/* 05 — Fingerprint */}
        <Section id="fingerprint" index="05" title={t.fp.title} lead={t.fp.lead}>
          <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
            <Card title={t.fp.fpTitle}>
              <div className="font-mono text-2xl md:text-3xl text-pink-400 break-all">{fingerprint?.id ?? t.fp.computing}</div>
              <p className="mt-3 text-sm text-white/60">{t.fp.desc}</p>
              {fingerprint?.canvasImage && (
                <div className="mt-5">
                  <div className="text-xs text-white/40 mb-2">{t.fp.canvasCaption}</div>
                  <img src={fingerprint.canvasImage} alt="Canvas fingerprint test image" className="w-full border border-white/10" />
                </div>
              )}
            </Card>
            <Card title={t.fp.ingredientsTitle}>
              <Rows>
                {fingerprint &&
                  Object.entries(fingerprint.components).map(([key, value]) => (
                    <Row key={key} label={key} value={key === "fonts" ? t.fp.detected(fingerprint.fonts.length) : value} />
                  ))}
              </Rows>
              {fingerprint && fingerprint.fonts.length > 0 && (
                <p className="mt-3 text-xs text-white/50 leading-relaxed">
                  <span className="text-white/30">{t.fp.fontsFound}</span>
                  {fingerprint.fonts.join(", ")}
                </p>
              )}
            </Card>
          </div>
          <Insight>{t.fp.insight}</Insight>
        </Section>

        {/* 06 — Behaviour */}
        <Section id="behavior" index="06" title={t.beh.title} lead={t.beh.lead}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Stat label={t.beh.secondsOnPage} value={Math.floor(behavior.secondsOnPage)} />
            <Stat label={t.beh.secondsLooking} value={Math.floor(behavior.visibleSeconds)} hint={t.beh.tabVisible} />
            <Stat label={t.beh.secondsIdle} value={Math.floor(behavior.idleSeconds)} hint={t.beh.sinceInput} />
            <Stat label={t.beh.tabLeft} value={behavior.tabSwitches} />
            <Stat label={t.beh.maxScroll} value={`${behavior.maxScrollPercent}%`} />
            <Stat label={t.beh.cursorTravel} value={`${Math.round(behavior.pointerDistancePx).toLocaleString("en")} px`} />
            <Stat label={t.beh.clicks} value={behavior.clicks} hint={behavior.lastClickTarget} />
            <Stat label={t.beh.rageClicks} value={behavior.rageClicks} hint={t.beh.rageHint} />
            <Stat label={t.beh.keys} value={behavior.keystrokes} />
            <Stat label={t.beh.blur} value={behavior.windowBlurs} />
            <Stat label={t.beh.resizes} value={behavior.resizes} />
            <Stat label={t.beh.copies} value={behavior.copies} hint={behavior.lastCopied && `"${behavior.lastCopied}"`} />
          </div>
          <Insight>{t.beh.insight}</Insight>
        </Section>

        {/* 07 — Typing */}
        <Section id="typing" index="07" title={t.typing.title} lead={t.typing.lead}>
          <TypingDemo />
        </Section>

        <ScreenShareDemo screen={{ ...screen, start: onScreenShare }} />
        <Clickjacking />
        <AutofillDemo />
        <ClipboardDemo />
        <Tabnabbing />
        <FakeWindow />
        <PhotoMetadata />

        {/* 15 — The point */}
        <Section id="combine" index="15" title={t.combine.title} lead={t.combine.lead}>
          <div className="grid gap-4 md:grid-cols-3">
            <Card title={t.combine.identifyTitle}>
              <p className="text-sm text-white/70 leading-relaxed">{t.combine.identifyBody}</p>
            </Card>
            <Card title={t.combine.followTitle}>
              <p className="text-sm text-white/70 leading-relaxed">{t.combine.followBody}</p>
            </Card>
            <Card title={t.combine.inferTitle}>
              <p className="text-sm text-white/70 leading-relaxed">{t.combine.inferBody}</p>
            </Card>
          </div>
        </Section>

        {/* 16 — Protect yourself */}
        <Section id="protect" index="16" title={t.protect.title} lead={t.protect.lead}>
          <div className="grid gap-4 md:grid-cols-2">
            {t.protect.tips.map(([title, text]) => (
              <Card key={title} title={title}>
                <p className="text-sm text-white/70 leading-relaxed">{text}</p>
              </Card>
            ))}
          </div>
        </Section>

        <footer className="border-t border-white/5 py-10 font-mono text-[11px] text-white/40 flex flex-col sm:flex-row justify-between gap-4">
          <span>{t.footer}</span>
          <a href="/" className="text-cyan-400 hover:text-cyan-300">faiznfi.github.io</a>
        </footer>
      </div>
    </div>
  );
}
