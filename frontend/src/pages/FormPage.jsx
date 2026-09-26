import { useState } from 'react';
import { pinjamLocker } from '../api';

export default function FormPage({ locker, onBerhasil, onKembali }) {
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [pinMahasiswa, setPinMahasiswa] = useState('');
  const [ulangiPin, setUlangiPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (pinMahasiswa.length !== 4) {
      setError('PIN kamu harus 4 digit angka');
      return;
    }
    if (pinMahasiswa !== ulangiPin) {
      setError('Konfirmasi PIN tidak sama');
      return;
    }
    setLoading(true);
    try {
      const updated = await pinjamLocker(locker.id, { nama, nim, pinMahasiswa });
      onBerhasil(updated);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal meminjam loker');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page-sempit">
      <button className="btn btn-link" onClick={onKembali}>&larr; Kembali</button>
      <h1>Form Peminjaman {locker.nomor}</h1>
      <p className="kecil">Isi data kamu dan buat PIN sendiri untuk ambil barang nanti. Setelah dikirim, loker langsung terlihat "Sedang Dipinjam" oleh mahasiswa lain, dan sistem otomatis membuatkan 2 PIN untuk driver Gojek.</p>
      <form onSubmit={submit} className="form-card">
        <label>Nama Lengkap</label>
        <input value={nama} onChange={e => setNama(e.target.value)} placeholder="Contoh: Budi Santoso" required />

        <label>NIM</label>
        <input value={nim} onChange={e => setNim(e.target.value)} placeholder="Contoh: 5023201045" required />

        <label>Buat PIN Kamu (4 digit, untuk ambil barang nanti)</label>
        <input
          className="keypad-input"
          value={pinMahasiswa}
          onChange={e => setPinMahasiswa(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="••••"
          required
        />

        <label>Ulangi PIN</label>
        <input
          className="keypad-input"
          value={ulangiPin}
          onChange={e => setUlangiPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="••••"
          required
        />

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Pinjam Loker Ini'}
        </button>
      </form>
    </div>
  );
}
