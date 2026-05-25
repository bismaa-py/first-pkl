import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Package, MapPin, Filter } from 'lucide-react';
import api from '../api/axios';
import { usePopup } from '../context/PopupContext';

export default function DaftarBarang() {
  const { showAlert, showConfirm } = usePopup();
  const [barangs, setBarangs] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [barangRes, kategoriRes] = await Promise.all([
        api.get('/barang'),
        api.get('/kategori'),
      ]);
      setBarangs(barangRes.data.data || []);
      setKategoris(kategoriRes.data.data || []);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = await showConfirm('Konfirmasi Hapus', 'Yakin ingin menghapus barang ini?');
    if (!confirmDelete) return;
    try {
      await api.delete(`/barang/${id}`);
      setBarangs(barangs.filter((b) => b.id !== id));
      setDeleteId(null);
    } catch (err) {
      showAlert('Gagal', err.response?.data?.message || 'Gagal menghapus barang', 'error');
    }
  };

  const filtered = barangs.filter((b) => {
    const matchSearch =
      b.nama.toLowerCase().includes(search.toLowerCase()) ||
      b.kode_barang.toLowerCase().includes(search.toLowerCase());
    const matchKategori = filterKategori ? b.kategori_id == filterKategori : true;
    return matchSearch && matchKategori;
  });

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Memuat data barang...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Daftar Barang</h1>
          <p className="page__desc">Kelola inventaris barang sarana prasarana</p>
        </div>
        {user.role === 'admin' && (
          <Link to="/barang/tambah" className="btn btn--primary">
            <Plus size={18} />
            Tambah Barang
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="filter-bar">
          <div className="filter-bar__search">
            <Search size={18} className="filter-bar__icon" />
            <input
              type="text"
              placeholder="Cari nama atau kode barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="filter-bar__select">
            <Filter size={18} className="filter-bar__icon" />
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="form-input"
            >
              <option value="">Semua Kategori</option>
              {kategoris.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card__body">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <p>Tidak ada barang ditemukan</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th>Total</th>
                    <th>Tersedia</th>
                    <th>Kondisi</th>
                    <th>Lokasi</th>
                    {user.role === 'admin' && <th>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id}>
                      <td><span className="code-badge">{b.kode_barang}</span></td>
                      <td className="td-bold">{b.nama}</td>
                      <td>{b.kategori?.nama || '-'}</td>
                      <td>{b.jumlah_total}</td>
                      <td>
                        <span className={`stock-badge ${b.jumlah_tersedia === 0 ? 'stock-badge--empty' : b.jumlah_tersedia <= 2 ? 'stock-badge--low' : 'stock-badge--ok'}`}>
                          {b.jumlah_tersedia}
                        </span>
                      </td>
                      <td>{b.kondisi}</td>
                      <td>
                        <span className="location-text">
                          <MapPin size={14} />
                          {b.lokasi || '-'}
                        </span>
                      </td>
                      {user.role === 'admin' && (
                        <td>
                          <div className="action-btns">
                            <Link to={`/barang/edit/${b.id}`} className="btn btn--sm btn--ghost" title="Ubah">
                              <Edit2 size={16} />
                            </Link>
                            <button onClick={() => handleDelete(b.id)} className="btn btn--sm btn--ghost btn--danger" title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
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
