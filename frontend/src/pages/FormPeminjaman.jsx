import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, ClipboardList } from 'lucide-react';
import api from '../api/axios';
import { usePopup } from '../context/PopupContext';

export default function FormPeminjaman() {
  const navigate = useNavigate();
  const { showAlert } = usePopup();
  const [barangs, setBarangs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [form, setForm] = useState({
    barang_id: '',
    jumlah: 1,
    tanggal_pinjam: new Date().toISOString().split('T')[0],
    tanggal_kembali: '',
    catatan: '',
  });

  useEffect(() => {
    fetchBarang();
  }, []);

  const fetchBarang = async () => {
    try {
      const res = await api.get('/barang/tersedia');
      setBarangs(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat barang:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'barang_id') {
      const found = barangs.find((b) => b.id === Number(value));
      setSelectedBarang(found || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    if (form.tanggal_pinjam < today) {
      await showAlert('Gagal', 'Tanggal pinjam tidak boleh sebelum tanggal hari ini!', 'error');
      return;
    }
    if (!form.tanggal_kembali) {
      await showAlert('Gagal', 'Tanggal kembali wajib diisi!', 'error');
      return;
    }
    if (form.tanggal_kembali < form.tanggal_pinjam) {
      await showAlert('Gagal', 'Tanggal kembali tidak boleh sebelum tanggal pinjam!', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/peminjaman', {
        barang_id: Number(form.barang_id),
        jumlah: Number(form.jumlah),
        tanggal_pinjam: form.tanggal_pinjam,
        tanggal_kembali: form.tanggal_kembali,
        catatan: form.catatan,
      });
      await showAlert('Berhasil', 'Peminjaman berhasil diajukan!', 'info');
      navigate('/peminjaman');
    } catch (err) {
      await showAlert('Gagal', err.response?.data?.message || 'Gagal mengajukan peminjaman', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <button onClick={() => navigate('/peminjaman')} className="btn btn--ghost btn--back">
            <ArrowLeft size={18} />
            Kembali
          </button>
          <h1 className="page__title">Ajukan Peminjaman</h1>
          <p className="page__desc">Isi form berikut untuk mengajukan peminjaman barang</p>
        </div>
      </div>

      <div className="card">
        <div className="card__body">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group form-group--full">
              <label className="form-label">Pilih Barang *</label>
              <select
                name="barang_id"
                value={form.barang_id}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">-- Pilih Barang --</option>
                {barangs.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nama} ({b.kode_barang}) - Tersedia: {b.jumlah_tersedia}
                  </option>
                ))}
              </select>
            </div>

            {selectedBarang && (
              <div className="form-group form-group--full">
                <div className="info-card">
                  <ClipboardList size={20} />
                  <div>
                    <p className="info-card__title">{selectedBarang.nama}</p>
                    <p className="info-card__text">
                      Kode: {selectedBarang.kode_barang} | Stok tersedia: <strong>{selectedBarang.jumlah_tersedia}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group form-group--third">
              <label className="form-label">Jumlah *</label>
              <input
                type="number"
                name="jumlah"
                value={form.jumlah}
                onChange={handleChange}
                className="form-input"
                min="1"
                max={selectedBarang?.jumlah_tersedia || 999}
                required
              />
            </div>

            <div className="form-group form-group--third">
              <label className="form-label">Tanggal Pinjam *</label>
              <input
                type="date"
                name="tanggal_pinjam"
                value={form.tanggal_pinjam}
                onChange={handleChange}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group form-group--third">
              <label className="form-label">Tanggal Kembali *</label>
              <input
                type="date"
                name="tanggal_kembali"
                value={form.tanggal_kembali}
                onChange={handleChange}
                className="form-input"
                min={form.tanggal_pinjam || new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">Catatan *</label>
              <textarea
                name="catatan"
                value={form.catatan}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="Tujuan peminjaman, keterangan tambahan..."
                rows={3}
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate('/peminjaman')} className="btn btn--ghost">
                Batal
              </button>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? (
                  <span className="btn__loader"></span>
                ) : (
                  <>
                    <Save size={18} />
                    Ajukan Peminjaman
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
