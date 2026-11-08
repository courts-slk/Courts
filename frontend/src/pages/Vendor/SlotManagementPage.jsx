import { useState, useEffect, useCallback } from 'react';
import { vendorAPI, courtsAPI } from '../../api/client';
import { formatDate, formatTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './Vendor.module.css';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 9); // 9..22

export default function SlotManagementPage() {
  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateDays, setGenerateDays] = useState(1);
  const [progress, setProgress] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    vendorAPI.getCourts()
      .then(({ data }) => {
        setCourts(data);
        if (data.length > 0) setSelectedCourtId(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoadingCourts(false));
  }, []);

  const loadSlots = useCallback(() => {
    if (!selectedCourtId || !selectedDate) return;
    setLoadingSlots(true);
    vendorAPI.getSlots(selectedCourtId, selectedDate)
      .then(({ data }) => setSlots(data))
      .catch(console.error)
      .finally(() => setLoadingSlots(false));
  }, [selectedCourtId, selectedDate]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const handleGenerate = async () => {
    if (!selectedCourtId) return;
    setGenerating(true);
    setSuccessMsg('');
    setErrorMsg('');
    let created = 0;

    for (const h of HOURS) {
      const start_time = `${String(h).padStart(2, '0')}:00`;
      const end_time   = `${String(h + 1).padStart(2, '0')}:00`;
      setProgress(`Creating ${formatTime(start_time)}...`);
      try {
        await courtsAPI.createSlots(selectedCourtId, {
          date: selectedDate,
          start_time,
          end_time,
          recurring: generateDays > 1,
          days: generateDays,
        });
        created++;
      } catch (err) {
        // slot likely already exists — skip
      }
    }

    setProgress('');
    setGenerating(false);
    setSuccessMsg(`Done! Generated ${created} hourly slot${created !== 1 ? 's' : ''} for ${generateDays > 1 ? `${generateDays} days` : 'this date'}.`);
    loadSlots();
  };

  const handleBlock = async (slot) => {
    try {
      await vendorAPI.blockSlot(slot.id, { is_blocked: !slot.is_blocked });
      setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, is_blocked: s.is_blocked ? 0 : 1 } : s));
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update slot');
    }
  };

  // Generate next 14 date options
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() + i * 86400000);
    return d.toISOString().split('T')[0];
  });

  if (loadingCourts) return <LoadingSpinner />;

  return (
    <div className={styles.page}>
      <h1>Slot Management</h1>

      {courts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <p>You have no courts yet. Add a court first.</p>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div className={styles.formGroup}>
                <label>Court</label>
                <select
                  value={selectedCourtId}
                  onChange={(e) => setSelectedCourtId(e.target.value)}
                  disabled={generating}
                >
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Date</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={generating}
                >
                  {dateOptions.map(d => (
                    <option key={d} value={d}>{formatDate(d)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)' }}>
              <p style={{ fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>
                Generate Hourly Slots (9:00 AM – 11:00 PM)
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <label style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>For</label>
                  <select
                    value={generateDays}
                    onChange={(e) => setGenerateDays(parseInt(e.target.value))}
                    disabled={generating}
                    style={{ width: '100px' }}
                  >
                    {[1, 3, 7, 14, 30].map(d => (
                      <option key={d} value={d}>{d === 1 ? 'this day' : `${d} days`}</option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (progress || 'Generating...') : '+ Generate All Slots'}
                </button>
              </div>

              {successMsg && (
                <div style={{ marginTop: 'var(--space-3)', color: 'var(--primary)', fontWeight: 500, fontSize: 'var(--font-sm)' }}>
                  ✓ {successMsg}
                </div>
              )}
              {errorMsg && <div className="error" style={{ marginTop: 'var(--space-3)' }}>{errorMsg}</div>}
            </div>
          </div>

          {/* Slot list */}
          <h2 style={{ color: 'var(--primary)', marginBottom: 'var(--space-4)' }}>
            Slots for {formatDate(selectedDate)}
          </h2>

          {loadingSlots ? (
            <LoadingSpinner />
          ) : slots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <p>No slots for this date. Use the generator above to create them.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
              {slots
                .slice()
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map(slot => (
                  <div
                    key={slot.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid ${slot.is_blocked ? 'var(--danger)' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-3)',
                      textAlign: 'center',
                      opacity: slot.is_blocked ? 0.7 : 1,
                    }}
                  >
                    <p style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                      {formatTime(slot.start_time)}
                    </p>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                    </p>
                    <span className={`badge ${slot.is_blocked ? 'danger' : 'success'}`} style={{ display: 'block', marginBottom: 'var(--space-3)' }}>
                      {slot.is_blocked ? 'Blocked' : 'Open'}
                    </span>
                    <button
                      className={`btn ${slot.is_blocked ? 'btn-primary' : 'btn-danger'}`}
                      onClick={() => handleBlock(slot)}
                      style={{ width: '100%', fontSize: 'var(--font-xs)', minHeight: '32px', padding: '4px 8px' }}
                    >
                      {slot.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
