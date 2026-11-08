import { useState, useEffect } from 'react';
import { vendorAPI, courtsAPI } from '../../api/client';
import Modal from '../../components/Modal';
import { formatCurrency } from '../../utils/formatters';
import { validateCourt } from '../../utils/validators';
import styles from './Vendor.module.css';

export default function CourtManagementPage() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', city: 'colombo', address: '', surface_type: '', pitch_size: '', price_per_hour: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    vendorAPI.getCourts()
      .then(({ data }) => setCourts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openNewForm = () => {
    setFormData({ name: '', city: 'colombo', address: '', surface_type: '', pitch_size: '', price_per_hour: '' });
    setEditingId(null);
    setIsEditing(false);
    setErrors({});
    setShowModal(true);
  };

  const openEditForm = (court) => {
    setFormData({ ...court });
    setEditingId(court.id);
    setIsEditing(true);
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const validateErrors = validateCourt(formData);
    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await courtsAPI.update(editingId, formData);
      } else {
        await courtsAPI.create(formData);
      }
      const { data } = await vendorAPI.getCourts();
      setCourts(data);
      setShowModal(false);
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this court?')) return;
    try {
      await courtsAPI.delete(id);
      setCourts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading courts...</div>;

  return (
    <div className={styles.page}>
      <h1>My Courts</h1>
      <button className="btn btn-primary" onClick={openNewForm} style={{ marginBottom: 'var(--space-6)' }}>
        + Add New Court
      </button>

      {courts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No courts yet. Create your first court!</p>
        </div>
      ) : (
        <div className={styles.courtList}>
          {courts.map(court => (
            <div key={court.id} className={styles.courtItem}>
              <div>
                <div className={styles.courtName}>{court.name}</div>
                <div className={styles.courtMeta}>{court.city} • {formatCurrency(court.price_per_hour)}/hr</div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-secondary" onClick={() => openEditForm(court)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(court.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} title={isEditing ? 'Edit Court' : 'Add New Court'} onClose={() => setShowModal(false)}>
        <div className={styles.form} style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
          <div className={styles.formGroup}>
            <label>Court Name</label>
            <input name="name" value={formData.name} onChange={handleChange} disabled={saving} />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>

          <div className={styles.formGroup}>
            <label>City</label>
            <select name="city" value={formData.city} onChange={handleChange} disabled={saving}>
              <option value="colombo">Colombo</option>
              <option value="kandy">Kandy</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Address</label>
            <input name="address" value={formData.address} onChange={handleChange} disabled={saving} />
            {errors.address && <div className="error">{errors.address}</div>}
          </div>

          <div className={styles.formGroup}>
            <label>Surface Type</label>
            <input name="surface_type" value={formData.surface_type} onChange={handleChange} placeholder="e.g., Artificial Turf" disabled={saving} />
          </div>

          <div className={styles.formGroup}>
            <label>Pitch Size</label>
            <input name="pitch_size" value={formData.pitch_size} onChange={handleChange} placeholder="e.g., 5-a-side" disabled={saving} />
          </div>

          <div className={styles.formGroup}>
            <label>Price per Hour (LKR)</label>
            <input type="number" name="price_per_hour" value={formData.price_per_hour} onChange={handleChange} disabled={saving} />
            {errors.price_per_hour && <div className="error">{errors.price_per_hour}</div>}
          </div>

          {errors.submit && <div className="error">{errors.submit}</div>}

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving} style={{ flex: 1 }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving...' : 'Save Court'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
