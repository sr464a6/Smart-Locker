import { Router } from 'express';
import { db, addLog } from '../db.js';

const router = Router();

function pin4() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function findLocker(req, res) {
  const id = Number(req.params.id);
  const locker = db.data.lockers.find(l => l.id === id);
  if (!locker) {
    res.status(404).json({ error: 'Loker tidak ditemukan' });
    return null;
  }
  return locker;
}

// GET semua loker - status ini yang dilihat semua user (real-time via polling)
router.get('/', async (req, res) => {
  await db.read();
  res.json(db.data.lockers);
});

router.get('/:id', async (req, res) => {
  await db.read();
  const locker = findLocker(req, res);
  if (!locker) return;
  res.json(locker);
});

// STEP form: isi nama, nim, dan mahasiswa BUAT SENDIRI PIN untuk ambil barang nanti.
// Sistem auto-generate 2 PIN gojek: pinGojek1 (utama) & pinGojek2 (cadangan/opsional).
router.post('/:id/pinjam', async (req, res) => {
  await db.read();
  const locker = findLocker(req, res);
  if (!locker) return;
  if (locker.status !== 'KOSONG') {
    return res.status(400).json({ error: 'Loker sudah dipinjam orang lain' });
  }
  const { nama, nim, pinMahasiswa } = req.body;
  if (!nama || !nim) {
    return res.status(400).json({ error: 'Nama dan NIM wajib diisi' });
  }
  if (!/^\d{4}$/.test(pinMahasiswa || '')) {
    return res.status(400).json({ error: 'PIN kamu harus 4 digit angka' });
  }

  locker.status = 'DIPINJAM';
  locker.nama = nama;
  locker.nim = nim;

  locker.pinMahasiswa = pinMahasiswa;
  locker.pinMahasiswaAktif = false; // baru aktif otomatis setelah barang pertama masuk

  locker.pinGojek1 = pin4();
  locker.pinGojek1Aktif = true;
  locker.pinGojek2 = pin4();
  locker.pinGojek2Aktif = true; // cadangan, opsional — bisa dipakai bisa tidak

  locker.pintuTerbukaUntuk = null;
  addLog(locker, `Dipinjam oleh ${nama} (${nim}). PIN pribadi dibuat + 2 PIN gojek digenerate.`);
  locker.updatedAt = new Date().toISOString();
  await db.write();
  res.json(locker);
});

// Keypad fisik: cocokkan PIN yang diketik ke salah satu dari 3 PIN yang aktif
router.post('/:id/verify-pin', async (req, res) => {
  await db.read();
  const locker = findLocker(req, res);
  if (!locker) return;
  const { pin } = req.body;

  if (locker.status !== 'DIPINJAM') {
    return res.status(400).json({ ok: false, keterangan: 'Loker tidak sedang dipinjam' });
  }

  if (locker.pinGojek1Aktif && pin === locker.pinGojek1) {
    locker.pintuTerbukaUntuk = 'gojek1';
    addLog(locker, 'PIN gojek (utama) benar. Pintu terbuka untuk drop-off.');
    await db.write();
    return res.json({ ok: true, keterangan: 'PIN gojek utama valid, pintu terbuka' });
  }

  if (locker.pinGojek2Aktif && pin === locker.pinGojek2) {
    locker.pintuTerbukaUntuk = 'gojek2';
    addLog(locker, 'PIN gojek (cadangan) benar. Pintu terbuka untuk drop-off tambahan.');
    await db.write();
    return res.json({ ok: true, keterangan: 'PIN gojek cadangan valid, pintu terbuka' });
  }

  if (locker.pinMahasiswaAktif && pin === locker.pinMahasiswa) {
    locker.pintuTerbukaUntuk = 'mahasiswa';
    addLog(locker, 'PIN mahasiswa benar. Pintu terbuka untuk ambil barang.');
    await db.write();
    return res.json({ ok: true, keterangan: 'PIN kamu valid, pintu terbuka' });
  }

  addLog(locker, `Percobaan PIN salah/tidak berlaku: ${pin}`);
  await db.write();
  res.status(401).json({ ok: false, keterangan: 'PIN salah atau tidak berlaku' });
});

// Sensor pintu tertutup:
// - gojek1/gojek2 -> PIN itu hangus sendiri-sendiri; PIN mahasiswa otomatis AKTIF
//   (kalau belum aktif) begitu ada drop-off pertama. PIN gojek yang belum
//   dipakai TETAP aktif (opsional, jaga-jaga driver lupa taruh sisanya).
// - mahasiswa -> PIN mahasiswa hangus, loker AUTO reset total ke KOSONG,
//   PIN gojek yang belum sempat dipakai ikut hangus (siklus peminjaman selesai).
router.post('/:id/door-closed', async (req, res) => {
  await db.read();
  const locker = findLocker(req, res);
  if (!locker) return;

  if (locker.pintuTerbukaUntuk === 'gojek1' || locker.pintuTerbukaUntuk === 'gojek2') {
    const dipakai = locker.pintuTerbukaUntuk;
    if (dipakai === 'gojek1') locker.pinGojek1Aktif = false;
    if (dipakai === 'gojek2') locker.pinGojek2Aktif = false;

    if (!locker.pinMahasiswaAktif) {
      locker.pinMahasiswaAktif = true;
      addLog(locker, `Pintu tertutup. PIN gojek hangus. Barang masuk, PIN kamu sekarang AKTIF untuk ambil.`);
    } else {
      addLog(locker, `Pintu tertutup. PIN gojek cadangan hangus (drop-off tambahan selesai).`);
    }
    locker.pintuTerbukaUntuk = null;
  } else if (locker.pintuTerbukaUntuk === 'mahasiswa') {
    addLog(locker, `Pintu tertutup. Loker ${locker.nomor} otomatis terkunci & kosong lagi, siap dipinjam orang lain.`);
    locker.status = 'KOSONG';
    locker.nama = null;
    locker.nim = null;
    locker.pinMahasiswa = null;
    locker.pinMahasiswaAktif = false;
    locker.pinGojek1 = null;
    locker.pinGojek1Aktif = false;
    locker.pinGojek2 = null;
    locker.pinGojek2Aktif = false;
    locker.pintuTerbukaUntuk = null;
    locker.log = [];
  } else {
    addLog(locker, 'Pintu tertutup tanpa sesi PIN aktif (diabaikan).');
  }

  locker.updatedAt = new Date().toISOString();
  await db.write();
  res.json(locker);
});

export default router;
