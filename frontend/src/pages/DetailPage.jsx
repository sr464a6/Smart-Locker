import { useState } from 'react';
import { verifyPin, doorClosed, getLocker } from '../api';

export default function DetailPage({ locker, onUpdated, onKembali }) {
  const [pin, setPin] = useState('');
  const [pesan, setPesan] = useState('');

  const pintuTerbuka = !!locker.pintuTerbukaUntuk;

  async function kirimPin() {
    try {
      const hasil = await verifyPin(locker.id, pin);
      setPesan(hasil.keterangan);
    } catch (err) {
      setPesan(err.response?.data?.keterangan || 'PIN salah');
    }
    const fresh = await getLocker(locker.id);
    onUpdated(fresh);
    setPin('');
  }

  async function tutupPintu() {
    const fresh = await doorClosed(locker.id);
    onUpdated(fresh);
    if (fresh.status === 'KOSONG') {
      setPesan('Pintu tertutup & terkunci otomatis. Loker kosong lagi, siap dipinjam mahasiswa lain.');
    } else if (!fresh.pintuTerbukaUntuk) {
      setPesan(fresh.pinMahasiswaAktif
        ? 'Pintu tertutup. PIN gojek yang dipakai hangus, PIN kamu sudah aktif.'
        : 'Pintu tertutup.');
    }
  }

  const labelAksi = { gojek1: 'drop-off (PIN utama)', gojek2: 'drop-off tambahan (PIN cadangan)', mahasiswa: 'ambil barang' };

  return (
    <div className="page page-sempit">
      <button className="btn btn-link" onClick={onKembali}>&larr; Kembali ke daftar loker</button>
      <h1>{locker.nomor}</h1>
      <p className="kecil">a.n {locker.nama} ({locker.nim})</p>

      <div className="pin-row">
        <div className={`pin-box ${!locker.pinGojek1Aktif ? 'pin-box-muted' : ''}`}>
          <span>PIN Gojek — Utama (drop-off)</span>
          <strong>{locker.pinGojek1Aktif ? locker.pinGojek1 : '••••'}</strong>
          <p className="kecil">Kirim ke driver via chat. Hangus otomatis begitu dipakai & pintu ditutup.</p>
        </div>
        <div className={`pin-box ${!locker.pinGojek2Aktif ? 'pin-box-muted' : ''}`}>
          <span>PIN Gojek — Cadangan (opsional)</span>
          <strong>{locker.pinGojek2Aktif ? locker.pinGojek2 : '••••'}</strong>
          <p className="kecil">Cuma dipakai kalau driver ada barang yang ketinggalan. Boleh tidak dipakai sama sekali.</p>
        </div>
        <div className={`pin-box ${!locker.pinMahasiswaAktif ? 'pin-box-muted' : ''}`}>
          <span>PIN Kamu (ambil barang)</span>
          <strong>{locker.pinMahasiswa}</strong>
          <p className="kecil">{locker.pinMahasiswaAktif ? 'Sudah aktif, bisa dipakai untuk ambil barang.' : 'Aktif otomatis setelah barang pertama masuk.'}</p>
        </div>
      </div>

      <div className="panel">
        <h3>Simulasi Keypad Fisik Loker</h3>
        <p className="kecil">Mewakili keypad ESP32 di badan loker.</p>
        <input
          className="keypad-input"
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="Masukkan PIN"
        />
        <div className="aksi-row">
          <button className="btn btn-primary" onClick={kirimPin} disabled={pin.length !== 4}>Enter</button>
          <button className="btn" onClick={tutupPintu} disabled={!pintuTerbuka}>Tutup Pintu (sensor)</button>
        </div>
        {pesan && <p className="kecil">{pesan}</p>}
        {pintuTerbuka && <p className="kecil status-buka">Status fisik: PINTU TERBUKA untuk {labelAksi[locker.pintuTerbukaUntuk]}</p>}
      </div>

      <div className="panel">
        <h4>Riwayat</h4>
        <ul className="log">
          {locker.log?.map((it, idx) => (
            <li key={idx}><span className="kecil">{new Date(it.waktu).toLocaleTimeString('id-ID')}</span> — {it.pesan}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
