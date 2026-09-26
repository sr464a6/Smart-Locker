import { useEffect, useState, useCallback } from 'react';
import { getLockers } from './api';
import GridPage from './pages/GridPage';
import FormPage from './pages/FormPage';
import DetailPage from './pages/DetailPage';

export default function App() {
  const [page, setPage] = useState('grid');
  const [lockers, setLockers] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const muat = useCallback(async () => {
    const data = await getLockers();
    setLockers(data);
  }, []);

  useEffect(() => {
    muat();
    const interval = setInterval(muat, 2500);
    return () => clearInterval(interval);
  }, [muat]);

  const activeLocker = lockers.find(l => l.id === activeId) || null;

  function pilihLoker(locker) {
    if (locker.status !== 'KOSONG') return;
    setActiveId(locker.id);
    setPage('form');
  }

  function pinjamBerhasil(updated) {
    setLockers(prev => prev.map(l => (l.id === updated.id ? updated : l)));
    setPage('detail');
  }

  function updateLocker(updated) {
    setLockers(prev => prev.map(l => (l.id === updated.id ? updated : l)));
    if (updated.status === 'KOSONG') {
      setTimeout(() => { setActiveId(null); setPage('grid'); }, 1500);
    }
  }

  return (
    <div className="app-shell">
      {page === 'grid' && <GridPage lockers={lockers} onPilih={pilihLoker} />}
      {page === 'form' && activeLocker && (
        <FormPage locker={activeLocker} onBerhasil={pinjamBerhasil} onKembali={() => setPage('grid')} />
      )}
      {page === 'detail' && activeLocker && (
        <DetailPage locker={activeLocker} onUpdated={updateLocker} onKembali={() => { setActiveId(null); setPage('grid'); }} />
      )}
    </div>
  );
}
