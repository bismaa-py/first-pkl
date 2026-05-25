import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, Save, X } from 'lucide-react';
import api from '../api/axios';
import { usePopup } from '../context/PopupContext';

export default function Kategori() {
  const { showAlert, showConfirm } = usePopup();
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nama: '', deskripsi: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/kategori');
      setKategoris(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ nama: '', deskripsi: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (k) => {
    setForm({ nama: k.nama, deskripsi: k.deskripsi || '' });
    setEditId(k.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/kategori/${editId}`, form);
      } else {
        await api.post('/kategori', form);
      }
      resetForm();
      fetchData();
    } catch (err) {
      showAlert('Gagal', err.response?.data?.message || 'Gagal menyimpan kategori', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = await showConfirm('Konfirmasi Hapus', 'Yakin ingin menghapus kategori ini?');
    if (!confirmDelete) return;
    try {
      await api.delete(`/kategori/${id}`);
      fetchData();
    } catch (err) {
      showAlert('Gagal', err.response?.data?.message || 'Gagal menghapus kategori', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Memuat kategori...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Kategori Barang</h1>
          <p className="page__desc">Kelola kategori untuk mengelompokkan barang</p>
        </div>
        {user.role === 'admin' && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn--primary">
            <Plus size={18} />
            Tambah Kategori
          </button>
        )}
      </div>

      {/* Form Inline */}
      {showForm && user.role === 'admin' && (
        <div className="card card--highlight">
          <div className="card__header">
            <h2 className="card__title">{editId ? 'Ubah Kategori' : 'Tambah Kategori Baru'}</h2>
            <button onClick={resetForm} className="btn btn--ghost btn--sm">
              <X size={18} />
            </button>
          </div>
          <div className="card__body">
            <form onSubmit={handleSubmit} className="form-inline">
              <div className="form-group">
                <label className="form-label">Nama Kategori *</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="form-input"
                  placeholder="Contoh: Elektronik"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <input
                  type="text"
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="form-input"
                  placeholder="Deskripsi singkat (opsional)"
                />
              </div>
              <div className="form-inline__actions">
                <button type="button" onClick={resetForm} className="btn btn--ghost">Batal</button>
                <button type="submit" className="btn btn--primary">
                  <Save size={16} />
                  {editId ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="kategori-grid">
        {kategoris.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <FolderOpen size={48} />
              <p>Belum ada kategori</p>
            </div>
          </div>
        ) : (
          kategoris.map((k) => (
            <div key={k.id} className="kategori-card">
              <div className="kategori-card__icon">
                <FolderOpen size={24} />
              </div>
              <div className="kategori-card__info">
                <h3 className="kategori-card__name">{k.nama}</h3>
                <p className="kategori-card__desc">{k.deskripsi || 'Tidak ada deskripsi'}</p>
              </div>
              {user.role === 'admin' && (
                <div className="kategori-card__actions">
                  <button onClick={() => handleEdit(k)} className="btn btn--sm btn--ghost" title="Ubah">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(k.id)} className="btn btn--sm btn--ghost btn--danger" title="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
