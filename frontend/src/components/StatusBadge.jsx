export default function StatusBadge({ status }) {
  const statusConfig = {
    menunggu: { label: 'Menunggu', className: 'badge--warning' },
    disetujui: { label: 'Disetujui', className: 'badge--success' },
    ditolak: { label: 'Ditolak', className: 'badge--danger' },
    dipinjam: { label: 'Dipinjam', className: 'badge--info' },
    dikembalikan: { label: 'Dikembalikan', className: 'badge--neutral' },
    konfirmasi_kembali: { label: 'Konfirmasi Kembali', className: 'badge--purple' },
    pending: { label: 'Menunggu', className: 'badge--warning' },
    active: { label: 'Aktif', className: 'badge--success' },
    rejected: { label: 'Ditolak', className: 'badge--danger' },
  };

  const config = statusConfig[status] || { label: status, className: 'badge--neutral' };

  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}
