import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ClipboardList, CheckCircle, Clock, Users, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent'),
      ]);
      setStats(statsRes.data.data);
      setRecent(recentRes.data.data);
    } catch (err) {
      console.error('Gagal memuat data dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Memuat dasbor...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Barang',
      value: stats?.total_barang || 0,
      icon: Package,
      color: 'blue',
      link: '/barang',
    },
    {
      label: 'Barang Tersedia',
      value: stats?.barang_tersedia || 0,
      icon: CheckCircle,
      color: 'emerald',
      link: '/barang',
    },
    {
      label: 'Peminjaman Aktif',
      value: stats?.peminjaman_aktif || 0,
      icon: ClipboardList,
      color: 'violet',
      link: '/peminjaman',
    },
    {
      label: 'Menunggu Persetujuan',
      value: stats?.menunggu_persetujuan || 0,
      icon: Clock,
      color: 'amber',
      link: '/peminjaman',
    },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Dasbor</h1>
          <p className="page__desc">Selamat datang, {user.nama || 'Pengguna'}!</p>
        </div>
        {user.role === 'admin' && (
          <div className="page__header-badge">
            <Users size={16} />
            <span>{stats?.total_user || 0} Pengguna Terdaftar</span>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link to={card.link} key={card.label} className={`stat-card stat-card--${card.color}`}>
              <div className="stat-card__icon">
                <Icon size={24} />
              </div>
              <div className="stat-card__info">
                <p className="stat-card__value">{card.value}</p>
                <p className="stat-card__label">{card.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Peminjaman Terbaru</h2>
          <Link to="/peminjaman" className="card__link">
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>
        <div className="card__body">
          {recent.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={48} />
              <p>Belum ada peminjaman</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Peminjam</th>
                    <th>Barang</th>
                    <th>Jumlah</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td className="td-bold">{item.user?.nama || '-'}</td>
                      <td>{item.barang?.nama || '-'}</td>
                      <td>{item.jumlah}</td>
                      <td>{new Date(item.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
                      <td><StatusBadge status={item.status} /></td>
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
