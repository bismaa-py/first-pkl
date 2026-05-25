import { useState } from 'react';
import {
  BookOpen,
  Shield,
  User,
  Package,
  ClipboardList,
  Users,
  ScrollText,
  History,
  MapPin,
  Calendar,
  Key,
  Info,
  CheckCircle,
  HelpCircle,
  FolderPlus,
  UserCheck
} from 'lucide-react';

export default function Panduan() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  const adminGuides = [
    {
      id: 'adm-dashboard',
      title: 'Dasbor & Monitoring Realtime',
      icon: ScrollText,
      color: '#4f46e5',
      desc: 'Memantau seluruh aktivitas sarana prasarana sekolah secara terpusat.',
      steps: [
        'Halaman Utama menampilkan statistik total inventaris barang, barang tersedia, dan peminjaman aktif saat ini.',
        'Tabel "Peminjaman Terbaru" memberikan overview cepat transaksi peminjaman terhangat dari para siswa dan guru.'
      ]
    },
    {
      id: 'adm-barang',
      title: 'Manajemen Barang & Lokasi Khusus',
      icon: Package,
      color: '#0ea5e9',
      desc: 'Mengelola data inventaris barang sekolah dengan aturan lokasi khusus.',
      steps: [
        'Menambah Barang Baru: Klik tombol "Tambah Barang" di halaman Daftar Barang.',
        'Aturan Khusus Lokasi (ATK): Barang yang termasuk kategori "ATK" secara otomatis hanya diperbolehkan berada di "Ruang TU". Sistem akan mengunci dan memvalidasi ini.',
        'Aturan Khusus Lokasi (Non-ATK): Barang kategori lain hanya diperbolehkan berada di "Ruang Sarpras" atau "Gudang Olahraga".',
        'Mengubah/Menghapus Barang: Klik ikon edit untuk memperbarui data, atau ikon hapus. Barang yang sedang aktif dipinjam tidak dapat dihapus demi keamanan data.'
      ]
    },
    {
      id: 'adm-kategori',
      title: 'Manajemen Kategori Barang',
      icon: FolderPlus,
      color: '#10b981',
      desc: 'Mengelompokkan inventaris barang agar lebih terorganisir.',
      steps: [
        'Buka halaman "Kategori" untuk menambah, mengubah, atau menghapus kategori barang.',
        'Setiap kategori dapat ditautkan dengan barang saat menambahkan barang baru di form barang.'
      ]
    },
    {
      id: 'adm-approval',
      title: 'Persetujuan & Verifikasi Peminjaman',
      icon: ClipboardList,
      color: '#f59e0b',
      desc: 'Memproses pengajuan pinjam barang dan verifikasi pengembalian fisik.',
      steps: [
        'Persetujuan Peminjaman: Pada menu "Peminjaman" tab "Menunggu", Anda dapat menyetujui atau menolak peminjaman yang diajukan oleh pengguna.',
        'Verifikasi Pengembalian: Ketika pengguna mengembalikan barang dan mengeklik konfirmasi, status berubah menjadi "Konfirmasi". Admin wajib memverifikasi pengembalian fisik barang dengan mengeklik tombol centang biru. Stok barang akan otomatis bertambah kembali.'
      ]
    },
    {
      id: 'adm-users',
      title: 'Pengelola Pengguna & Atur Ulang Kata Sandi',
      icon: Users,
      color: '#ec4899',
      desc: 'Mengontrol pendaftaran akun dan pemulihan kredensial pengguna.',
      steps: [
        'Aktivasi Akun (Persetujuan): Setiap pendaftar baru berstatus "Menunggu". Buka halaman "Pengelola Pengguna" untuk menyetujui atau menolak akun tersebut sebelum mereka bisa masuk (login).',
        'Atur Ulang Kata Sandi Pengguna: Untuk melakukan atur ulang kata sandi, edit pengguna yang bersangkutan di halaman Pengelola Pengguna dan masukkan kata sandi barunya langsung di form tersebut.'
      ]
    },
    {
      id: 'adm-log',
      title: 'Log Aktivitas (Auto-Cleanup)',
      icon: ScrollText,
      color: '#8b5cf6',
      desc: 'Melihat riwayat audit sistem untuk keamanan dan transparansi.',
      steps: [
        'Halaman "Log Aktivitas" mencatat semua tindakan penting seperti Login, Registrasi, Peminjaman, dan Tindakan Admin.',
        'Fitur Pembersihan Otomatis: Sistem secara otomatis menghapus log aktivitas yang telah berusia lebih dari 7 hari setiap 24 jam untuk menghemat ruang penyimpanan.'
      ]
    },
    {
      id: 'adm-history',
      title: 'Riwayat Lengkap Peminjaman',
      icon: History,
      color: '#6b7280',
      desc: 'Melihat seluruh transaksi peminjaman yang sudah selesai.',
      steps: [
        'Halaman "Riwayat Peminjaman" menampung seluruh transaksi dengan status "Dikembalikan" dan "Ditolak".',
        'Anda dapat menyaring data berdasarkan nama peminjam/barang, rentang tanggal pinjam, dan status transaksi.'
      ]
    }
  ];

  const userGuides = [
    {
      id: 'usr-dashboard',
      title: 'Dasbor Personal & Privasi Data',
      icon: User,
      color: '#4f46e5',
      desc: 'Melihat statistik peminjaman milik Anda secara privat.',
      steps: [
        'Halaman Utama didesain khusus agar Anda hanya melihat jumlah barang yang Anda pinjam saat ini.',
        'Pengguna lain tidak dapat melihat riwayat peminjaman maupun statistik barang milik Anda (Privasi Terjaga).'
      ]
    },
    {
      id: 'usr-browse',
      title: 'Melihat & Mencari Barang',
      icon: Package,
      color: '#0ea5e9',
      desc: 'Menelusuri sarana prasarana yang siap dipinjam.',
      steps: [
        'Buka menu "Daftar Barang" untuk melihat semua inventaris sekolah.',
        'Gunakan fitur pencarian atau filter berdasarkan kategori untuk menemukan barang dengan cepat.',
        'Stok tersedia dan lokasi fisik barang (misalnya Ruang TU atau Gudang Olahraga) ditampilkan secara transparan.'
      ]
    },
    {
      id: 'usr-borrow',
      title: 'Mengajukan Peminjaman Barang',
      icon: ClipboardList,
      color: '#10b981',
      desc: 'Langkah meminjam barang inventaris sekolah.',
      steps: [
        'Klik tombol "Ajukan Peminjaman" di kanan atas halaman Peminjaman atau Daftar Barang.',
        'Pilih barang, masukkan jumlah unit yang ingin dipinjam (tidak boleh melebihi stok yang tersedia).',
        'Tentukan Tanggal Pinjam dan Tanggal Kembali.',
        'Aturan Penting: Tanggal Kembali tidak boleh sebelum Tanggal Pinjam. Sistem akan menolak otomatis jika aturan ini dilanggar.',
        'Tulis catatan tujuan peminjaman, lalu klik "Ajukan Peminjaman". Pengajuan akan masuk status "Menunggu" persetujuan admin.'
      ]
    },
    {
      id: 'usr-return',
      title: 'Konfirmasi Pengembalian Barang',
      icon: CheckCircle,
      color: '#f59e0b',
      desc: 'Prosedur mengembalikan barang yang telah selesai digunakan.',
      steps: [
        'Jika peminjaman Anda sudah disetujui admin, statusnya akan menjadi "Disetujui".',
        'Setelah selesai menggunakan barang secara fisik, buka menu "Peminjaman".',
        'Temukan transaksi Anda, dan klik tombol "Konfirmasi Kembali" (ikon kotak centang ungu).',
        'Status peminjaman akan berubah menjadi "Konfirmasi". Admin sarpras akan memverifikasi pengembalian fisik barang untuk mengembalikan stok ke inventaris.'
      ]
    },
    {
      id: 'usr-history',
      title: 'Riwayat Peminjaman Saya',
      icon: History,
      color: '#8b5cf6',
      desc: 'Melihat riwayat transaksi Anda yang telah selesai.',
      steps: [
        'Setiap peminjaman yang telah dikembalikan secara terverifikasi atau telah ditolak oleh admin akan otomatis dipindahkan ke halaman "Riwayat Peminjaman" Anda.',
        'Halaman ini berisi info detail seperti Tanggal Pinjam, Tanggal Kembali, serta Tanggal Aktual Barang Dikembalikan.'
      ]
    },
    {
      id: 'usr-profile',
      title: 'Profil & Unggah Foto Profil',
      icon: UserCheck,
      color: '#ec4899',
      desc: 'Mengelola informasi akun Anda sendiri.',
      steps: [
        'Buka halaman "Profil Saya" dari menu sidebar.',
        'Anda dapat mengubah nama lengkap Anda, namun untuk alamat email bersifat permanen demi keamanan data.',
        'Ganti Foto Profil: Klik ikon kamera pada foto profil Anda untuk mengunggah foto baru. Ukuran file maksimal adalah 2MB.',
        'Atur Ulang Kata Sandi: Demi keamanan data, penggantian kata sandi pengguna harus dilakukan melalui Admin Sarpras secara langsung.'
      ]
    }
  ];

  const currentGuides = isAdmin ? adminGuides : userGuides;

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen className="text-primary" size={28} />
            Panduan Pengguna
          </h1>
          <p className="page__desc">Panduan lengkap cara penggunaan sistem informasi SARPRAS</p>
        </div>
      </div>


      <div className="grid grid--2col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Intro Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(14, 165, 233, 0.05) 100%)', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
          <div className="card__body" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '24px' }}>
            <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Info size={24} />
            </div>
            <div>
              <h3 className="card__title" style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--color-text-dark)' }}>
                Sistem Peminjaman Barang Sekolah (SAPRAS)
              </h3>
              <p className="card__desc" style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                Selamat datang di halaman Panduan Pengguna. Sistem ini dirancang untuk mempermudah inventarisasi dan alur peminjaman sarana prasarana sekolah agar lebih transparan, terjaga privasinya, dan memiliki pelaporan yang rapi. Di bawah ini adalah panduan lengkap mengenai cara penggunaan fitur sistem yang disesuaikan dengan peran Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Guides Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentGuides.map((guide, idx) => {
            const IconComponent = guide.icon;
            const isOpen = expandedSection === guide.id;
            return (
              <div
                key={guide.id}
                className="card"
                style={{
                  transition: 'all 0.3s ease',
                  border: isOpen ? `1px solid ${guide.color}` : '1px solid var(--color-border)'
                }}
              >
                <div
                  className="card__header"
                  onClick={() => toggleSection(guide.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        backgroundColor: `${guide.color}15`,
                        color: guide.color,
                        padding: '10px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--color-text-dark)' }}>
                        {guide.title}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        {guide.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    <HelpCircle size={18} />
                  </div>
                </div>

                {isOpen && (
                  <div
                    className="card__body"
                    style={{
                      padding: '0 20px 20px 20px',
                      borderTop: '1px solid var(--color-border)',
                      backgroundColor: 'rgba(0,0,0,0.01)'
                    }}
                  >
                    <ul style={{ margin: '16px 0 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {guide.steps.map((step, sIdx) => (
                        <li
                          key={sIdx}
                          style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: 'var(--color-text-normal)'
                          }}
                        >
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
