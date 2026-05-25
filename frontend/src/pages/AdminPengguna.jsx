import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Edit2, Trash2, Users, Filter } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { usePopup } from '../context/PopupContext';

export default function AdminPengguna() {
  const { showAlert, showConfirm } = usePopup();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const url = '/users';
      const res = await api.get(url);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const confirm = await showConfirm('Setujui Pengguna', 'Setujui pendaftaran pengguna ini?');
    if (!confirm) return;
    try {
      await api.put(`/users/${id}/approve`);
      await showAlert('Berhasil', 'Pendaftaran pengguna berhasil disetujui.', 'info');
      fetchUsers();
    } catch (err) {
      await showAlert('Gagal', err.response?.data?.message || 'Gagal menyetujui', 'error');
    }
  };

  const handleReject = async (id) => {
    const confirm = await showConfirm('Tolak Pengguna', 'Tolak pendaftaran pengguna ini?');
    if (!confirm) return;
    try {
      await api.put(`/users/${id}/reject`);
      await showAlert('Berhasil', 'Pendaftaran pengguna berhasil ditolak.', 'info');
      fetchUsers();
    } catch (err) {
      await showAlert('Gagal', err.response?.data?.message || 'Gagal menolak', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await showConfirm('Hapus Pengguna', 'Hapus pengguna ini? Tindakan ini tidak bisa dibatalkan.');
    if (!confirm) return;
    try {
      await api.delete(`/users/${id}`);
      await showAlert('Berhasil', 'Pengguna berhasil dihapus.', 'info');
      fetchUsers();
    } catch (err) {
      await showAlert('Gagal', err.response?.data?.message || 'Gagal menghapus', 'error');
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      nama: user.nama,
      email: user.email,
      role: user.role,
      jabatan: user.jabatan || '',
      nip: user.nip || '',
      nisn: user.nisn || '',
      kelas: user.kelas || '',
      status: user.status,
      password: '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editForm };
      if (!payload.password) delete payload.password;
      await api.put(`/users/${editUser.id}`, payload);
      setEditUser(null);
      await showAlert('Berhasil', 'Data pengguna berhasil diperbarui.', 'info');
      fetchUsers();
    } catch (err) {
      await showAlert('Gagal', err.response?.data?.message || 'Gagal memperbarui', 'error');
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.nama || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.nip || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.nisn || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? u.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    semua: users.length,
    pending: users.filter((u) => u.status === 'pending').length,
    active: users.filter((u) => u.status === 'active').length,
    rejected: users.filter((u) => u.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Pengelola Pengguna</h1>
          <p className="page__desc">Kelola akun pengguna sistem SAPRAS</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="status-tabs">
        <button
          className={`status-tab ${filterStatus === '' ? 'status-tab--active' : ''}`}
          onClick={() => setFilterStatus('')}
        >
          Semua ({statusCounts.semua})
        </button>
        <button
          className={`status-tab ${filterStatus === 'pending' ? 'status-tab--active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Menunggu ({statusCounts.pending})
        </button>
        <button
          className={`status-tab ${filterStatus === 'active' ? 'status-tab--active' : ''}`}
          onClick={() => setFilterStatus('active')}
        >
          Aktif ({statusCounts.active})
        </button>
        <button
          className={`status-tab ${filterStatus === 'rejected' ? 'status-tab--active' : ''}`}
          onClick={() => setFilterStatus('rejected')}
        >
          Ditolak ({statusCounts.rejected})
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="filter-bar">
          <div className="filter-bar__search filter-bar__search--full">
            <Search size={18} className="filter-bar__icon" />
            <input
              type="text"
              placeholder="Cari nama, email, NIP, atau NISN..."
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
              <Users size={48} />
              <p>Tidak ada data pengguna</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Jabatan</th>
                    <th>NIP/NISN</th>
                    <th>Kelas</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id}>
                      <td className="td-bold">{u.nama}</td>
                      <td>{u.email}</td>
                      <td>{u.jabatan ? u.jabatan.charAt(0).toUpperCase() + u.jabatan.slice(1) : '-'}</td>
                      <td>{u.nip || u.nisn || '-'}</td>
                      <td>{u.kelas || '-'}</td>
                      <td><StatusBadge status={u.status} /></td>
                      <td>
                        <div className="action-btns">
                          {u.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(u.id)}
                                className="btn btn--sm btn--success"
                                title="Setujui"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleReject(u.id)}
                                className="btn btn--sm btn--danger"
                                title="Tolak"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {u.status !== 'pending' && (
                            <button
                              onClick={() => openEdit(u)}
                              className="btn btn--sm btn--info"
                              title="Ubah"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {u.status !== 'pending' && u.role !== 'admin' && (
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="btn btn--sm btn--danger"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Ubah Pengguna</h2>
            <form onSubmit={handleEditSubmit} className="modal__form">
              <div className="form-group">
                <label className="form-label">Nama</label>
                <input
                  type="text"
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Peran (Tidak dapat diubah)</label>
                  <select
                    value={editForm.role}
                    className="form-input form-select form-input--disabled"
                    disabled
                  >
                    <option value="peminjam">Peminjam</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="form-input form-select"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="active">Aktif</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Jabatan (Tidak dapat diubah)</label>
                  <select
                    value={editForm.jabatan}
                    className="form-input form-select form-input--disabled"
                    disabled
                  >
                    <option value="">-</option>
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Kelas</label>
                  <input
                    type="text"
                    value={editForm.kelas}
                    onChange={(e) => setEditForm({ ...editForm, kelas: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">NIP (Tidak dapat diubah)</label>
                  <input
                    type="text"
                    value={editForm.nip}
                    className="form-input form-input--disabled"
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">NISN (Tidak dapat diubah)</label>
                  <input
                    type="text"
                    value={editForm.nisn}
                    className="form-input form-input--disabled"
                    disabled
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Kata Sandi Baru (kosongkan jika tidak diubah)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="form-input"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                />
              </div>
              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setEditUser(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn--primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
