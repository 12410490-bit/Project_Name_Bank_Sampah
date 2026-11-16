document.addEventListener("DOMContentLoaded", function() {
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ startOnLoad: true, theme: 'dark' });
    }

    const formLogin = document.getElementById('form-login-app');
    if (formLogin) {
        formLogin.addEventListener('submit', prosesLogin);
    }

    const inputPlastik = document.getElementById('input-plastik');
    const inputKardus = document.getElementById('input-kardus');
    if (inputPlastik && inputKardus) {
        inputPlastik.addEventListener('input', hitungSetoran);
        inputKardus.addEventListener('input', hitungSetoran);
    }
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-emerald-600', 'text-white');
        btn.classList.add('bg-slate-800', 'text-slate-400');
    });

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }

    const activeBtn = document.getElementById('btn-' + tabId.replace('tab-', ''));
    if (activeBtn) {
        activeBtn.classList.remove('bg-slate-800', 'text-slate-400');
        activeBtn.classList.add('bg-emerald-600', 'text-white');
    }

    if (tabId === 'tab-arsitektur' && typeof mermaid !== 'undefined') {
        setTimeout(() => {
            mermaid.run({
                querySelector: '.mermaid'
            });
        }, 150);
    }
}

function prosesLogin(event) {
    if (event) event.preventDefault();
    const role = document.getElementById('select-role').value;
    const username = document.getElementById('input-username').value;

    document.querySelectorAll('.ui-page').forEach(el => el.classList.add('hidden'));

    if (role === 'nasabah') {
        document.getElementById('page-nasabah').classList.remove('hidden');
        document.getElementById('nasabah-nama').innerText = "Halo, " + username + "!";
    } else if (role === 'petugas') {
        document.getElementById('page-petugas').classList.remove('hidden');
    } else if (role === 'bendahara') {
        document.getElementById('page-bendahara').classList.remove('hidden');
    } else if (role === 'ketua') {
        document.getElementById('page-ketua').classList.remove('hidden');
    }
}

function logout() {
    document.querySelectorAll('.ui-page').forEach(el => el.classList.add('hidden'));
    document.getElementById('page-login').classList.remove('hidden');
}

function hitungSetoran() {
    const kgPlastik = parseFloat(document.getElementById('input-plastik').value) || 0;
    const kgKardus = parseFloat(document.getElementById('input-kardus').value) || 0;

    const bruto = (kgPlastik * 2500) + (kgKardus * 1500);
    const kas = bruto * 0.10;
    const netto = bruto * 0.90;

    document.getElementById('txt-bruto').innerText = "Rp " + bruto.toLocaleString('id-ID');
    document.getElementById('txt-kas').innerText = "- Rp " + kas.toLocaleString('id-ID');
    document.getElementById('txt-netto').innerText = "+ Rp " + netto.toLocaleString('id-ID');
}

function prosesPenarikan() {
    const nominal = parseFloat(document.getElementById('input-tarik').value) || 0;
    if (nominal < 50000) {
        alert("Gagal: Aturan Bisnis membatasi Penarikan Minimum Rp 50.000!");
    } else {
        alert("Berhasil: Saldo sebesar Rp " + nominal.toLocaleString('id-ID') + " berhasil dicairkan!");
    }
}

function simpanSetoranAlert() {
    alert("Setoran Berhasil Disimpan ke Database!");
}

function salinSQL() {
    const code = document.getElementById('sqlCode').innerText;
    navigator.clipboard.writeText(code);
    alert('Kode SQL berhasil disalin!');
}
// ==========================================
// DATA MASTER SIMULASI (TERSINKRONISASI ANTAR AKTOR)
// ==========================================
const dbNasabah = {
    "BSL-089": {
        nama: "Ibu Maria",
        saldo: 147500,
        riwayat: [
            { judul: "Setoran Plastik & Kardus", tanggal: "10 Nov 2026", nominal: 22500, tipe: "masuk" },
            { judul: "Penarikan Saldo Tunai", tanggal: "28 Okt 2026", nominal: 50000, tipe: "keluar" }
        ]
    },
    "BSL-012": {
        nama: "Pak Robby",
        saldo: 180000,
        riwayat: [
            { judul: "Setoran Botol Plastik & Besi", tanggal: "11 Nov 2026", nominal: 180000, tipe: "masuk" }
        ]
    }
};

let kasOperasional = 1450000;
let nasabahAktifLogin = "BSL-089";
let antreanPencairan = []; // Menyimpan pengajuan penarikan yang menunggu konfirmasi Bendahara

function formatRupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

function getTanggalHariIni() {
    return new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

// ==========================================
// NAVIGASI TAB UTAMA
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-emerald-600', 'text-white');
        btn.classList.add('bg-slate-800', 'text-slate-400');
    });

    document.getElementById(tabId).classList.remove('hidden');
    const activeBtn = document.getElementById('btn-' + tabId.replace('tab-', ''));
    if (activeBtn) {
        activeBtn.classList.remove('bg-slate-800', 'text-slate-400');
        activeBtn.classList.add('bg-emerald-600', 'text-white');
    }
}

// ==========================================
// SISTEM LOGIN & PINDAH PERAN (ROLE)
// ==========================================
function updateLoginHint() {
    const role = document.getElementById("select-role").value;
    const selectUser = document.getElementById("input-username");

    if (role === "nasabah") {
        selectUser.innerHTML = `
            <option value="BSL-089">BSL-089 — Ibu Maria</option>
            <option value="BSL-012">BSL-012 — Pak Robby</option>
        `;
    } else if (role === "petugas") {
        selectUser.innerHTML = `<option value="PTG-01">PTG-01 — Petugas Timbang Lapangan</option>`;
    } else if (role === "bendahara") {
        selectUser.innerHTML = `<option value="BND-01">BND-01 — Bendahara Bank Sampah</option>`;
    } else if (role === "ketua") {
        selectUser.innerHTML = `<option value="KTU-01">KTU-01 — Ketua Pengurus</option>`;
    }
}

document.getElementById("form-login-app").addEventListener("submit", function (e) {
    e.preventDefault();
    const role = document.getElementById("select-role").value;
    const userVal = document.getElementById("input-username").value;

    document.querySelectorAll('.ui-page').forEach(p => p.classList.add('hidden'));

    if (role === "nasabah") {
        nasabahAktifLogin = userVal;
        renderHalamanNasabah();
        document.getElementById("page-nasabah").classList.remove("hidden");
    } else if (role === "petugas") {
        refreshDropdownNasabah();
        hitungSetoranRealtime();
        document.getElementById("page-petugas").classList.remove("hidden");
    } else if (role === "bendahara") {
        refreshDropdownNasabah();
        renderHalamanBendahara();
        document.getElementById("page-bendahara").classList.remove("hidden");
    } else if (role === "ketua") {
        document.getElementById("ketua-kas-display").innerText = formatRupiah(kasOperasional);
        document.getElementById("page-ketua").classList.remove("hidden");
    }
});

function logout() {
    document.querySelectorAll('.ui-page').forEach(p => p.classList.add('hidden'));
    document.getElementById("page-login").classList.remove("hidden");
}

function refreshDropdownNasabah() {
    const opsiHTML = Object.keys(dbNasabah).map(id => {
        const n = dbNasabah[id];
        return `<option value="${id}">${id} - ${n.nama} (Saldo: ${formatRupiah(n.saldo)})</option>`;
    }).join("");

    const selPetugas = document.getElementById("petugas-pilih-nasabah");
    const selBendahara = document.getElementById("bendahara-pilih-nasabah");
    if (selPetugas) selPetugas.innerHTML = opsiHTML;
    if (selBendahara) selBendahara.innerHTML = opsiHTML;
}

// ==========================================
// 1. LOGIKA NASABAH (PENGAJUAN CAIRKAN SALDO)
// ==========================================
function renderHalamanNasabah() {
    const data = dbNasabah[nasabahAktifLogin];
    document.getElementById("nasabah-nama").innerText = `Halo, ${data.nama}!`;
    document.getElementById("nasabah-buku").innerText = `No. Buku: ${nasabahAktifLogin}`;
    document.getElementById("saldo-display").innerText = formatRupiah(data.saldo);

    // Cek apakah nasabah ini memiliki pengajuan yang masih Pending di Bendahara
    const pendingUser = antreanPencairan.filter(a => a.nasabahId === nasabahAktifLogin && a.status === "Pending");
    const alertBox = document.getElementById("nasabah-pending-alert");
    const alertDetail = document.getElementById("nasabah-pending-detail");

    if (pendingUser.length > 0) {
        const totalPending = pendingUser.reduce((sum, item) => sum + item.nominal, 0);
        alertBox.classList.remove("hidden");
        alertDetail.innerText = `Sebesar ${formatRupiah(totalPending)} (Menunggu konfirmasi Bendahara)`;
    } else {
        alertBox.classList.add("hidden");
    }

    // Render Riwayat Transaksi yang SUDAH SELESAI (Penarikan Pending tidak muncul di riwayat selesai)
    const riwayatContainer = document.getElementById("nasabah-riwayat-container");
    riwayatContainer.innerHTML = data.riwayat.map(item => {
        const isMasuk = item.tipe === "masuk";
        return `
            <div class="bg-white p-2 rounded border flex justify-between items-center shadow-sm">
                <div>
                    <p class="font-bold">${item.judul}</p>
                    <p class="text-slate-400 text-[9px]">${item.tanggal}</p>
                </div>
                <span class="font-bold ${isMasuk ? 'text-emerald-700' : 'text-red-600'}">
                    ${isMasuk ? '+ ' : '- '}${formatRupiah(item.nominal)}
                </span>
            </div>
        `;
    }).join("");
}

function ajukanCairSaldoNasabah() {
    const inputEl = document.getElementById("input-nasabah-tarik");
    const nominal = parseInt(inputEl.value);
    const data = dbNasabah[nasabahAktifLogin];

    if (isNaN(nominal) || nominal < 50000) {
        alert("Gagal: Minimal penarikan saldo adalah Rp 50.000 (ketik angka tanpa titik, contoh: 50000).");
        return;
    }

    // Hitung total pending yang sudah diajukan sebelumnya agar tidak melebihi saldo
    const sudahPending = antreanPencairan
        .filter(a => a.nasabahId === nasabahAktifLogin && a.status === "Pending")
        .reduce((sum, item) => sum + item.nominal, 0);

    if (nominal + sudahPending > data.saldo) {
        alert("Gagal: Saldo Anda tidak mencukupi (termasuk pengajuan yang sedang menunggu persetujuan Bendahara).");
        return;
    }

    // Masukkan ke antrean Bendahara (Saldo Nasabah BELUM terpotong & BELUM masuk riwayat selesai)
    antreanPencairan.push({
        idReq: "REQ-" + Date.now(),
        nasabahId: nasabahAktifLogin,
        namaNasabah: data.nama,
        nominal: nominal,
        tanggal: getTanggalHariIni(),
        status: "Pending"
    });

    inputEl.value = "";
    alert(`Pengajuan pencairan sebesar ${formatRupiah(nominal)} berhasil dikirim!\n\nSaldo Anda belum berkurang sebelum dikonfirmasi oleh Bendahara. Silakan Keluar lalu masuk sebagai Bendahara untuk menyetujuinya.`);
    renderHalamanNasabah();
}

function lihatRiwayatPopup() {
    const data = dbNasabah[nasabahAktifLogin];
    if (data.riwayat.length === 0) {
        alert("Belum ada riwayat transaksi selesai.");
        return;
    }
    const daftar = data.riwayat.map((r, i) => `${i + 1}. [${r.tanggal}] ${r.judul}: ${r.tipe === 'masuk' ? '+' : '-'}${formatRupiah(r.nominal)}`).join("\n");
    alert(`MUTASI TRANSAKSI SELESAI (${data.nama}):\n\n${daftar}`);
}

// ==========================================
// 2. LOGIKA PETUGAS TIMBANG (SETOR SAMPAH)
// ==========================================
function hitungSetoranRealtime() {
    const kgPlastik = parseFloat(document.getElementById("input-plastik").value) || 0;
    const kgKardus = parseFloat(document.getElementById("input-kardus").value) || 0;

    const bruto = (kgPlastik * 2500) + (kgKardus * 1500);
    const kas = bruto * 0.10;
    const netto = bruto - kas;

    document.getElementById("txt-bruto").innerText = formatRupiah(bruto);
    document.getElementById("txt-kas").innerText = formatRupiah(kas);
    document.getElementById("txt-netto").innerText = "+ " + formatRupiah(netto);
}

function simpanSetoranAlert() {
    const idNasabah = document.getElementById("petugas-pilih-nasabah").value;
    const kgPlastik = parseFloat(document.getElementById("input-plastik").value) || 0;
    const kgKardus = parseFloat(document.getElementById("input-kardus").value) || 0;

    const bruto = (kgPlastik * 2500) + (kgKardus * 1500);
    if (bruto <= 0) {
        alert("Masukkan berat sampah terlebih dahulu!");
        return;
    }

    const kas = bruto * 0.10;
    const netto = bruto - kas;

    // Tambahkan saldo ke nasabah dan kas operasional
    dbNasabah[idNasabah].saldo += netto;
    kasOperasional += kas;

    dbNasabah[idNasabah].riwayat.unshift({
        judul: `Setoran Sampah (${kgPlastik}kg Plastik, ${kgKardus}kg Kardus)`,
        tanggal: getTanggalHariIni(),
        nominal: netto,
        tipe: "masuk"
    });

    refreshDropdownNasabah();
    alert(`Setoran berhasil disimpan!\nSaldo Netto ${formatRupiah(netto)} telah ditambahkan ke rekening ${dbNasabah[idNasabah].nama}.`);
}

// ==========================================
// 3. LOGIKA BENDAHARA (KONFIRMASI PENCAIRAN)
// ==========================================
function renderHalamanBendahara() {
    const container = document.getElementById("bendahara-antrean-container");
    const pendingList = antreanPencairan.filter(a => a.status === "Pending");

    if (pendingList.length === 0) {
        container.innerHTML = `<p class="text-slate-500 italic">Tidak ada pengajuan pencairan baru dari nasabah.</p>`;
        return;
    }

    container.innerHTML = pendingList.map(item => `
        <div class="bg-white p-3 rounded-lg border border-amber-400 flex flex-wrap justify-between items-center gap-2 shadow-sm">
            <div>
                <p class="font-bold text-slate-900">${item.nasabahId} — ${item.namaNasabah}</p>
                <p class="text-[11px] text-slate-600">Nominal Ajuan: <span class="font-extrabold text-amber-700">${formatRupiah(item.nominal)}</span> (${item.tanggal})</p>
            </div>
            <button onclick="konfirmasiPencairanBendahara('${item.idReq}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded text-[11px] shadow">
                <i class="fa-solid fa-check mr-1"></i> Konfirmasi & Cairkan
            </button>
        </div>
    `).join("");
}

function konfirmasiPencairanBendahara(idReq) {
    const item = antreanPencairan.find(a => a.idReq === idReq);
    if (!item || item.status !== "Pending") return;

    const nasabah = dbNasabah[item.nasabahId];
    if (item.nominal > nasabah.saldo) {
        alert("Gagal: Saldo nasabah tidak lagi mencukupi.");
        return;
    }

    // Potong saldo nasabah & catat ke riwayat selesai
    nasabah.saldo -= item.nominal;
    item.status = "Disetujui";

    nasabah.riwayat.unshift({
        judul: "Penarikan Saldo Tunai (Disetujui Bendahara)",
        tanggal: getTanggalHariIni(),
        nominal: item.nominal,
        tipe: "keluar"
    });

    refreshDropdownNasabah();
    renderHalamanBendahara();
    alert(`Konfirmasi Berhasil!\nPencairan sebesar ${formatRupiah(item.nominal)} untuk ${nasabah.nama} telah disetujui.\nSaldo nasabah otomatis berkurang menjadi ${formatRupiah(nasabah.saldo)} dan muncul di Riwayat Nasabah.`);
}

// Pencairan langsung oleh Bendahara tanpa lewat HP Nasabah
function prosesPenarikan() {
    const idNasabah = document.getElementById("bendahara-pilih-nasabah").value;
    const nominal = parseInt(document.getElementById("input-tarik").value);
    const nasabah = dbNasabah[idNasabah];

    if (isNaN(nominal) || nominal < 50000) {
        alert("Gagal: Aturan Bisnis membatasi Penarikan Minimum Rp 50.000! (Ketik angka tanpa titik, misal: 50000)");
        return;
    }

    if (nominal > nasabah.saldo) {
        alert(`Gagal: Saldo ${nasabah.nama} (${formatRupiah(nasabah.saldo)}) tidak mencukupi!`);
        return;
    }

    nasabah.saldo -= nominal;
    nasabah.riwayat.unshift({
        judul: "Penarikan Saldo Tunai (Loket Bendahara)",
        tanggal: getTanggalHariIni(),
        nominal: nominal,
        tipe: "keluar"
    });

    refreshDropdownNasabah();
    alert(`Berhasil! Penarikan sebesar ${formatRupiah(nominal)} untuk ${nasabah.nama} telah diproses.\nSisa saldo: ${formatRupiah(nasabah.saldo)}.`);
}

// ==========================================
// SALIN KODE SQL
// ==========================================
function salinSQL() {
    const teksSQL = document.getElementById("sqlCode").innerText;
    navigator.clipboard.writeText(teksSQL).then(() => {
        alert("Kode SQL berhasil disalin ke clipboard!");
    });
}