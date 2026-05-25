import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Package } from 'lucide-react';
import api from '../api/axios';
import { usePopup } from '../context/PopupContext';

export default function FormBarang() {
  const { showAlert } = usePopup();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama: '',
    kode_barang: '',
    kategori_id: '',
    jumlah_total: '',
    kondisi: 'Baik',
    lokasi: '',
    deskripsi: '',
  });

  useEffect(() => {
    fetchKategori();
    if (isEdit) fetchBarang();
  }, [id]);

  const fetchKategori = async () => {
    try {
      const res = await api.get('/kategori');
      setKategoris(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    }
  };

  const fetchBarang = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/barang/${id}`);
      const b = res.data.data;
      setForm({
        nama: b.nama,
        kode_barang: b.kode_barang,
        kategori_id: b.kategori_id || '',
        jumlah_total: b.jumlah_total,
        kondisi: b.kondisi,
        lokasi: b.lokasi || '',
        deskripsi: b.deskripsi || '',
      });
    } catch (err) {
      showAlert('Gagal', 'Barang tidak ditemukan', 'error');
      navigate('/barang');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCategoryName = (kategoriId) => {
    if (!kategoriId) return '';
    const cat = kategoris.find(k => k.id === Number(kategoriId));
    return cat ? cat.nama : '';
  };

  const isATK = getSelectedCategoryName(form.kategori_id).toUpperCase() === 'ATK';

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'kategori_id') {
      const cat = kategoris.find(k => k.id === Number(value));
      const catName = cat ? cat.nama : '';
      if (catName.toUpperCase() === 'ATK') {
        setForm(prev => ({ ...prev, [name]: value, lokasi: 'Ruang TU' }));
      } else {
        setForm(prev => ({
          ...prev,
          [name]: value,
          lokasi: prev.lokasi === 'Ruang TU' ? '' : prev.lokasi
        }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        kategori_id: form.kategori_id ? Number(form.kategori_id) : null,
        jumlah_total: Number(form.jumlah_total),
      };

      if (isEdit) {
        await api.put(`/barang/${id}`, payload);
      } else {
        await api.post('/barang', payload);
      }
      navigate('/barang');
    } catch (err) {
      showAlert('Gagal', err.response?.data?.message || 'Gagal menyimpan barang', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <button onClick={() => navigate('/barang')} className="btn btn--ghost btn--back">
            <ArrowLeft size={18} />
            Kembali
          </button>
          <h1 className="page__title">{isEdit ? 'Ubah Barang' : 'Tambah Barang Baru'}</h1>
          <p className="page__desc">{isEdit ? 'Perbarui informasi barang' : 'Tambahkan barang baru ke inventaris'}</p>
        </div>
      </div>

      <div className="card">
        <div className="card__body">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group form-group--half">
              <label className="form-label">Nama Barang *</label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                className="form-input"
                placeholder="Contoh: Proyektor Epson"
                required
              />
            </div>

            <div className="form-group form-group--half">
              <label className="form-label">Kode Barang *</label>
              <input
                type="text"
                name="kode_barang"
                value={form.kode_barang}
                onChange={handleChange}
                className="form-input"
                placeholder="Contoh: ELK-001"
                required
              />
            </div>

            <div className="form-group form-group--half">
              <label className="form-label">Kategori</label>
              <select
                name="kategori_id"
                value={form.kategori_id}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Pilih Kategori</option>
                {kategoris.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>

            <div className="form-group form-group--half">
              <label className="form-label">Jumlah Total *</label>
              <input
                type="number"
                name="jumlah_total"
                value={form.jumlah_total}
                onChange={handleChange}
                className="form-input"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="form-group form-group--half">
              <label className="form-label">Kondisi</label>
              <select
                name="kondisi"
                value={form.kondisi}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Baik">Baik</option>
                <option value="Cukup Baik">Cukup Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>

            <div className="form-group form-group--half">
              <label className="form-label">Lokasi *</label>
              <select
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                className="form-input form-select"
                required
              >
                {isATK ? (
                  <option value="Ruang TU">Ruang TU</option>
                ) : (
                  <>
                    <option value="">Pilih Lokasi</option>
                    <option value="Ruang Sarpras">Ruang Sarpras</option>
                    <option value="Gudang Olahraga">Gudang Olahraga</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">Deskripsi</label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="Deskripsi barang (opsional)"
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate('/barang')} className="btn btn--ghost">
                Batal
              </button>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? (
                  <span className="btn__loader"></span>
                ) : (
                  <>
                    <Save size={18} />
                    {isEdit ? 'Simpan Perubahan' : 'Simpan Barang'}
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
