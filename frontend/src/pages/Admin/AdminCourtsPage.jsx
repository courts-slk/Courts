import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from '../Vendor/Vendor.module.css';

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getCourts()
      .then(({ data }) => setCourts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id, isActive) => {
    try {
      await adminAPI.approveCourt(id, { is_active: !isActive });
      const { data } = await adminAPI.getCourts();
      setCourts(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update court');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading courts...</div>;

  return (
    <div className={styles.page}>
      <h1>Courts Management</h1>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Court Name</th>
            <th>Vendor</th>
            <th>City</th>
            <th>Price/hr</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {courts.map(court => (
            <tr key={court.id}>
              <td>{court.name}</td>
              <td>{court.vendor_name}</td>
              <td style={{ textTransform: 'capitalize' }}>{court.city}</td>
              <td>{formatCurrency(court.price_per_hour)}</td>
              <td>
                <span className={`badge ${court.is_active ? 'success' : 'danger'}`}>
                  {court.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{formatDate(court.created_at)}</td>
              <td>
                <button
                  className={`btn ${court.is_active ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => handleApprove(court.id, court.is_active)}
                  style={{ fontSize: 'var(--font-sm)' }}
                >
                  {court.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
