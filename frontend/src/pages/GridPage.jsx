export default function GridPage({ lockers, onPilih }) {
  const warna = { KOSONG: '#22c55e', DIPINJAM: '#eab308' };
  const label = { KOSONG: 'Kosong', DIPINJAM: 'Sedang Dipinjam' };

  return (
    <div className="page">
      <h1>🔒 Loker Pintar Kampus</h1>
      <p className="kecil">Pilih loker yang berstatus <b>Kosong</b> untuk mulai meminjam.</p>
      <div className="grid-loker">
        {lockers.map(l => (
          <button
            key={l.id}
            className="locker-card"
            style={{ borderColor: warna[l.status] }}
            onClick={() => onPilih(l)}
          >
            <div className="locker-nomor">{l.nomor}</div>
            <div className="locker-status" style={{ color: warna[l.status] }}>{label[l.status]}</div>
            {l.status !== 'KOSONG' && <div className="kecil">a.n {l.nama || '-'}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
