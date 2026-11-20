const headerUtama = document.getElementById("edwin_arsy_header");
const tombolMenu = document.getElementById("edwin_arsy_nav_toggle");
const navigasi = document.getElementById("edwin_arsy_nav");
const tautanNav = document.querySelectorAll(".edwin_arsy_nav-link");
const formulirKontak = document.getElementById("edwin_arsy_contact_form");
const statusFormulir = document.getElementById("edwin_arsy_form_status");
const kolomPorsi = Array.from(document.querySelectorAll("input[data-rasa]"));
const totalPesanan = document.getElementById("edwin_arsy_total");
const kontakWarung = document.getElementById("edwin_arsy_wa_warung");
const hargaPerPorsi = 1000;
const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0
});
const tombolSalinAlamat = document.getElementById("edwin_arsy_copy_btn");

// 1. Navigasi mobile (buka & tutup)
if (tombolMenu && navigasi) {
  tombolMenu.addEventListener("click", () => {
    const menuTerbuka = navigasi.classList.toggle("edwin_arsy_nav-open");
    tombolMenu.setAttribute("aria-expanded", String(menuTerbuka));
    tombolMenu.setAttribute("aria-label", menuTerbuka ? "Tutup menu navigasi" : "Buka menu navigasi");
  });

  navigasi.querySelectorAll("a").forEach((tautan) => {
    tautan.addEventListener("click", () => {
      navigasi.classList.remove("edwin_arsy_nav-open");
      tombolMenu.setAttribute("aria-expanded", "false");
      tombolMenu.setAttribute("aria-label", "Buka menu navigasi");
    });
  });
}

// 2. Efek bayangan header & indikator menu aktif saat scroll
const daftarBagian = document.querySelectorAll("main section[id]");
window.addEventListener("scroll", () => {
  if (headerUtama) {
    headerUtama.classList.toggle("edwin_arsy_header-scrolled", window.scrollY > 20);
  }

  let bagianAktif = "edwin_arsy_home";
  daftarBagian.forEach((bagian) => {
    if (window.scrollY >= bagian.offsetTop - 140) {
      bagianAktif = bagian.id;
    }
  });

  tautanNav.forEach((link) => {
    link.classList.toggle("edwin_arsy_nav-active", link.getAttribute("href") === `#${bagianAktif}`);
  });
});

// 3. Animasi halus saat bagian halaman muncul di layar (Scroll Reveal)
const elemenReveal = document.querySelectorAll(".edwin_arsy_reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("edwin_arsy_visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elemenReveal.forEach((el) => observer.observe(el));
} else {
  elemenReveal.forEach((el) => el.classList.add("edwin_arsy_visible"));
}

// 4. Filter kategori produk interaktif
const tombolFilter = document.querySelectorAll(".edwin_arsy_filter-btn");
const kartuProduk = document.querySelectorAll(".edwin_arsy_product-card");

tombolFilter.forEach((btn) => {
  btn.addEventListener("click", () => {
    tombolFilter.forEach((b) => b.classList.remove("edwin_arsy_filter-active"));
    btn.classList.add("edwin_arsy_filter-active");

    const kategoriDipilih = btn.getAttribute("data-filter");
    kartuProduk.forEach((kartu) => {
      const daftarKategori = (kartu.getAttribute("data-category") || "").split(" ");
      const tampilkan = kategoriDipilih === "semua" || daftarKategori.includes(kategoriDipilih);
      kartu.classList.toggle("edwin_arsy_hidden", !tampilkan);
    });
  });
});

// 5. Jumlah per rasa, tombol katalog, dan ringkasan pesanan
function bacaPesanan() {
  return kolomPorsi
    .map(kolom => ({ rasa: kolom.dataset.rasa, porsi: kolom.valueAsNumber }))
    .filter(item => Number.isSafeInteger(item.porsi) && item.porsi > 0);
}

function hitungPorsi(pesanan) {
  return pesanan.reduce((total, item) => total + item.porsi, 0);
}

function perbaruiRingkasan() {
  const jumlah = hitungPorsi(bacaPesanan());
  const biaya = jumlah * hargaPerPorsi;
  totalPesanan.textContent = kolomPorsi.every(kolom => kolom.validity.valid) &&
    Number.isSafeInteger(biaya) && kolomPorsi.every(kolom => !kolom.value || Number.isSafeInteger(kolom.valueAsNumber))
    ? `${jumlah} porsi · ${rupiah.format(biaya)}`
    : "Periksa jumlah porsi";
}

function ubahPorsi(kolom, langkah) {
  const awal = Number.isSafeInteger(kolom.valueAsNumber) ? kolom.valueAsNumber : 0;
  kolom.value = Math.max(0, awal + langkah);
  perbaruiRingkasan();
}

kolomPorsi.forEach(kolom => {
  kolom.addEventListener("input", perbaruiRingkasan);
  kolom.parentElement.querySelectorAll("button[data-ubah]").forEach(tombol => {
    tombol.addEventListener("click", () => ubahPorsi(kolom, Number(tombol.dataset.ubah)));
  });
});

document.querySelectorAll(".edwin_arsy_product-link[data-menu]").forEach(tautan => {
  tautan.addEventListener("click", () => {
    const kolom = kolomPorsi.find(input => input.dataset.rasa === tautan.dataset.menu);
    if (kolom) ubahPorsi(kolom, 1);
  });
});
window.addEventListener("pageshow", perbaruiRingkasan);

// 6. Tombol salin alamat lapak
if (tombolSalinAlamat) {
  tombolSalinAlamat.addEventListener("click", async () => {
    const alamatLapak = "Es Buah Ibu Uum - Jl. Mangkubumi RT 02 / RW 12 No. 18 (Dekat Masjid Al-Ikhlas), Tasikmalaya";
    try {
      await navigator.clipboard.writeText(alamatLapak);
      tombolSalinAlamat.textContent = "✓ Alamat Berhasil Disalin!";
      setTimeout(() => {
        tombolSalinAlamat.textContent = "📋 Salin Alamat Lapak";
      }, 2400);
    } catch {
      tombolSalinAlamat.textContent = "📍 Jl. Mangkubumi RT 02 / RW 12 No. 18";
    }
  });
}

// 7. Menampilkan tahun berjalan secara otomatis pada bagian footer
const elemenTahun = document.getElementById("edwin_arsy_year");
if (elemenTahun) {
  elemenTahun.textContent = new Date().getFullYear();
}

// 8. Buka satu draf WhatsApp berisi semua rasa yang dipesan.
formulirKontak.addEventListener("submit", event => {
  event.preventDefault();
  const nama = formulirKontak.elements.nama.value.trim();
  const jam = formulirKontak.elements.jam.value;
  const catatan = formulirKontak.elements.pesan.value.trim();
  const pesanan = bacaPesanan();
  const jumlah = hitungPorsi(pesanan);
  const biaya = jumlah * hargaPerPorsi;

  if (!nama) {
    statusFormulir.textContent = "Isi nama pemesan terlebih dahulu.";
    formulirKontak.elements.nama.focus();
    return;
  }
  if (!jumlah || !Number.isSafeInteger(biaya) ||
      kolomPorsi.some(kolom => kolom.value && !Number.isSafeInteger(kolom.valueAsNumber))) {
    statusFormulir.textContent = !jumlah
      ? "Pilih minimal satu porsi dari salah satu rasa."
      : "Periksa kembali jumlah porsi pesanan.";
    kolomPorsi[0].focus();
    return;
  }

  const barisPesan = [
    "Halo Bu Uum, saya ingin memesan es.",
    "",
    `Nama: ${nama}`,
    "Pesanan:",
    ...pesanan.map(item => `• ${item.rasa}: ${item.porsi} porsi`),
    "",
    `Total: ${jumlah} porsi (${rupiah.format(biaya)})`,
    `Jam ambil: ${jam} WIB`
  ];
  if (catatan) barisPesan.push(`Catatan: ${catatan}`);

  const tujuan = new URL(kontakWarung.href);
  tujuan.searchParams.set("text", barisPesan.join("\n"));
  window.open(tujuan.href, "_blank", "noopener,noreferrer");
  statusFormulir.textContent = "Draf pesanan siap. Tekan Kirim di WhatsApp untuk memesannya.";
});
