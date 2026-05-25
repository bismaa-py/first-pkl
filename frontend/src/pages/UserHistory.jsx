import { useState, useEffect } from 'react';
import { Search, History, Eye } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function UserHistory() {
  const [peminjamans, setPeminjamans] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const url = '/peminjaman/my-history';
      const res = await api.get(url);
      setPeminjamans(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = peminjamans.filter((p) => {
    const matchSearch = (p.barang?.nama || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? p.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    semua: peminjamans.length,
    menunggu: peminjamans.filter((p) => p.status === 'menunggu').length,
    disetujui: peminjamans.filter((p) => p.status === 'disetujui').length,
    dikembalikan: peminjamans.filter((p) => p.status === 'dikembalikan').length,
    ditolak: peminjamans.filter((p) => p.status === 'ditolak').length,
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Memuat riwayat peminjaman...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Riwayat Peminjaman</h1>
          <p className="page__desc">Riwayat semua peminjaman barang Anda</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="status-tabs">
        <button className={`status-tab ${filterStatus === '' ? 'status-tab--active' : ''}`} onClick={() => setFilterStatus('')}>
          Semua ({statusCounts.semua})
        </button>
        <button className={`status-tab ${filterStatus === 'menunggu' ? 'status-tab--active' : ''}`} onClick={() => setFilterStatus('menunggu')}>
          Menunggu ({statusCounts.menunggu})
        </button>
        <button className={`status-tab ${filterStatus === 'disetujui' ? 'status-tab--active' : ''}`} onClick={() => setFilterStatus('disetujui')}>
          Disetujui ({statusCounts.disetujui})
        </button>
        <button className={`status-tab ${filterStatus === 'dikembalikan' ? 'status-tab--active' : ''}`} onClick={() => setFilterStatus('dikembalikan')}>
          Dikembalikan ({statusCounts.dikembalikan})
        </button>
        <button className={`status-tab ${filterStatus === 'ditolak' ? 'status-tab--active' : ''}`} onClick={() => setFilterStatus('ditolak')}>
          Ditolak ({statusCounts.ditolak})
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="filter-bar">
          <div className="filter-bar__search filter-bar__search--full">
            <Search size={18} className="filter-bar__icon" />
            <input
              type="text"
              placeholder="Cari barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card__body">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <History size={48} />
              <p>Belum ada riwayat peminjaman</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Barang</th>
                    <th>Jumlah</th>
                    <th>Tgl Pinjam</th>
                    <th>Tgl Kembali</th>
                    <th>Tgl Dikembalikan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="td-bold">{p.barang?.nama || '-'}</td>
                      <td>{p.jumlah}</td>
                      <td>{new Date(p.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
                      <td>{p.tanggal_kembali ? new Date(p.tanggal_kembali).toLocaleDateString('id-ID') : '-'}</td>
                      <td>{p.tanggal_dikembalikan ? new Date(p.tanggal_dikembalikan).toLocaleDateString('id-ID') : '-'}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        <button
                          onClick={() => setSelectedPeminjaman(p)}
                          className="btn btn--sm btn--ghost"
                          title="Lihat Detail Peminjaman"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPeminjaman && (
        <div className="modal-overlay" onClick={() => setSelectedPeminjaman(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <h2 className="modal__title" style={{ margin: 0 }}>Detail Peminjaman #{selectedPeminjaman.id}</h2>
              <StatusBadge status={selectedPeminjaman.status} />
            </div>
            
            <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Section 1: Peminjam */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '8px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '4px', fontWeight: 600 }}>
                  Informasi Peminjam
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Nama Lengkap</p>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedPeminjaman.user?.nama || '-'}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Email</p>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedPeminjaman.user?.email || '-'}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Jabatan</p>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                      {selectedPeminjaman.user?.jabatan ? selectedPeminjaman.user.jabatan.charAt(0).toUpperCase() + selectedPeminjaman.user.jabatan.slice(1) : '-'}
                    </p>
                  </div>
                  {selectedPeminjaman.user?.jabatan === 'siswa' && (
                    <>
                      <div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>NISN</p>
                        <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedPeminjaman.user?.nisn || '-'}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Kelas</p>
                        <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedPeminjaman.user?.kelas || '-'}</p>
                      </div>
                    </>
                  )}
                  {selectedPeminjaman.user?.jabatan === 'guru' && (
                    <div>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>NIP</p>
                      <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedPeminjaman.user?.nip || '-'}</p>
                    </div>
                  )}
                  {!selectedPeminjaman.user?.jabatan && (
                    <>
                      {selectedPeminjaman.user?.nisn && (
                        <div>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>NISN</p>
                          <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedPeminjaman.user?.nisn}</p>
                        </div>
                      )}
                      {selectedPeminjaman.user?.nip && (
                        <div>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>NIP</p>
                          <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedPeminjaman.user?.nip}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Section 2: Barang */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '8px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '4px', fontWeight: 600 }}>
                  Detail Barang
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Nama Barang</p>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedPeminjaman.barang?.nama || '-'}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Kode Barang</p>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)', fontFamily: 'monospace' }}>{selectedPeminjaman.barang?.kode_barang || '-'}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Kategori</p>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedPeminjaman.barang?.kategori?.nama || '-'}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Lokasi Penyimpanan</p>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedPeminjaman.barang?.lokasi || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Detail Peminjaman */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '8px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '4px', fontWeight: 600 }}>
                  Rincian Peminjaman
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Jumlah Dipinjam</p>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{selectedPeminjaman.jumlah} unit</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Tanggal Pinjam</p>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{new Date(selectedPeminjaman.tanggal_pinjam).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Batas Kembali</p>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                      {selectedPeminjaman.tanggal_kembali 
                        ? new Date(selectedPeminjaman.tanggal_kembali).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Tidak ditentukan'}
                    </p>
                  </div>
                  {selectedPeminjaman.tanggal_dikembalikan && (
                    <div>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Tanggal Dikembalikan</p>
                      <p style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                        {new Date(selectedPeminjaman.tanggal_dikembalikan).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Catatan / Alasan Peminjaman</p>
                    <p style={{ fontWeight: 500, color: 'var(--color-text)', backgroundColor: 'var(--color-bg)', padding: '10px', borderRadius: 'var(--radius-sm)', marginTop: '4px', borderLeft: '3px solid var(--color-primary)' }}>
                      {selectedPeminjaman.catatan || 'Tidak ada catatan'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal__actions" style={{ marginTop: '24px' }}>
              <button className="btn btn--primary" onClick={() => setSelectedPeminjaman(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
