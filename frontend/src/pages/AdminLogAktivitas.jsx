import { useState, useEffect } from 'react';
import { Search, ScrollText } from 'lucide-react';
import api from '../api/axios';

export default function AdminLogAktivitas() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/activity-logs');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat log:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((log) => {
    const matchSearch =
      (log.user?.nama || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.detail || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionBadge = (action) => {
    const map = {
      'Login': 'badge--info',
      'Register': 'badge--success',
      'Peminjaman': 'badge--warning',
      'Approve Peminjaman': 'badge--success',
      'Reject Peminjaman': 'badge--danger',
      'Return Peminjaman': 'badge--neutral',
      'Konfirmasi Pengembalian': 'badge--purple',
      'Approve User': 'badge--success',
      'Reject User': 'badge--danger',
      'Update User': 'badge--info',
      'Delete User': 'badge--danger',
    };
    return map[action] || 'badge--neutral';
  };

  const translateAction = (action) => {
    const map = {
      'Login': 'Masuk',
      'Register': 'Daftar',
      'Peminjaman': 'Peminjaman',
      'Approve Peminjaman': 'Peminjaman Disetujui',
      'Reject Peminjaman': 'Peminjaman Ditolak',
      'Return Peminjaman': 'Pengembalian Diverifikasi',
      'Konfirmasi Pengembalian': 'Konfirmasi Pengembalian',
      'Approve User': 'Pengguna Disetujui',
      'Reject User': 'Pengguna Ditolak',
      'Update User': 'Pengguna Diperbarui',
      'Delete User': 'Pengguna Dihapus',
      'Delete Foto Profil': 'Hapus Foto Profil',
    };
    return map[action] || action;
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Memuat log aktivitas...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Log Aktivitas</h1>
          <p className="page__desc">Riwayat aktivitas semua pengguna (otomatis terhapus setelah 7 hari)</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="filter-bar">
          <div className="filter-bar__search filter-bar__search--full">
            <Search size={18} className="filter-bar__icon" />
            <input
              type="text"
              placeholder="Cari pengguna, aksi, atau detail..."
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
              <ScrollText size={48} />
              <p>Tidak ada log aktivitas</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Pengguna</th>
                    <th>Aksi</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <tr key={log.id}>
                      <td className="td-nowrap">{formatDate(log.created_at)}</td>
                      <td className="td-bold">{log.user?.nama || '-'}</td>
                      <td>
                        <span className={`badge ${getActionBadge(log.action)}`}>
                          {translateAction(log.action)}
                        </span>
                      </td>
                      <td>{log.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
