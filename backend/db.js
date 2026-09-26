import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adapter = new JSONFile(path.join(__dirname, 'data', 'db.json'));
const TOTAL_LOKER = 12;

function defaultLockers() {
  const arr = [];
  for (let i = 1; i <= TOTAL_LOKER; i++) {
    arr.push({
      id: i,
      nomor: `L-${String(i).padStart(2, '0')}`,
      status: 'KOSONG', // KOSONG | DIPINJAM
      nama: null,
      nim: null,
      // PIN mahasiswa dibuat sendiri oleh mahasiswa saat form peminjaman
      pinMahasiswa: null,
      pinMahasiswaAktif: false, // aktif otomatis setelah barang pertama kali di-drop driver
      // 2 PIN gojek auto-generate: pin1 = utama, pin2 = cadangan/opsional (misal driver lupa taruh sebagian)
      pinGojek1: null,
      pinGojek1Aktif: false,
      pinGojek2: null,
      pinGojek2Aktif: false,
      pintuTerbukaUntuk: null, // 'gojek1' | 'gojek2' | 'mahasiswa'
      log: [],
      updatedAt: new Date().toISOString()
    });
  }
  return arr;
}

export const db = new Low(adapter, { lockers: [] });

export async function initDb() {
  await db.read();
  if (!db.data || !db.data.lockers?.length) {
    db.data = { lockers: defaultLockers() };
    await db.write();
  }
}

export function addLog(locker, pesan) {
  locker.log.unshift({ waktu: new Date().toISOString(), pesan });
  locker.log = locker.log.slice(0, 15);
}
