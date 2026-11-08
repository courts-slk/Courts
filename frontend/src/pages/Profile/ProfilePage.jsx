import { useState } from 'react';
import { authAPI } from '../../api/client';
import { getUser, setUser } from '../../utils/auth';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const user = getUser();
  const [form, setForm] = useState({ full_name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [smsOn, setSmsOn] = useState(true);
  const [waOn, setWaOn]   = useState(true);
  const [mktOn, setMktOn] = useState(false);

  const initials = form.full_name
    ? form.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || '??';

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      setUser(data.user || { ...user, ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ on, onToggle }) => (
    <button className={`${styles.toggle} ${on ? '' : styles.toggleOff}`} onClick={onToggle} aria-pressed={on} type="button" />
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Profile</h1>
        <p className={styles.subtitle}>Manage your account</p>
      </div>

      <div className={styles.twoThirds}>
        {/* Profile form */}
        <div className={styles.card}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>{form.full_name || user?.email}</h2>
              <p className={styles.profileSub}>{user?.email} · {user?.role || 'Player'}</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Full Name</label>
              <input className={styles.formInput} name="full_name" value={form.full_name} onChange={handleChange} type="text" placeholder="Your name" />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Email Address</label>
              <input className={styles.formInput} name="email" value={form.email} onChange={handleChange} type="email" placeholder="your@email.com" />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Phone Number</label>
              <input className={styles.formInput} name="phone" value={form.phone} onChange={handleChange} type="tel" placeholder="+94 77 000 0000" />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.btnPrimary} disabled={saving}>
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
              </button>
              <button type="button" className={styles.btnBeige} onClick={() => alert('Change password coming soon!')}>Change Password</button>
            </div>
          </form>
        </div>

        <div>
          {/* Notifications */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Notifications</div>
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>SMS Confirmations</div>
                <div className={styles.settingSub}>Booking &amp; cancellation alerts</div>
              </div>
              <Toggle on={smsOn} onToggle={() => setSmsOn(v => !v)} />
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>WhatsApp Alerts</div>
                <div className={styles.settingSub}>Real-time booking updates</div>
              </div>
              <Toggle on={waOn} onToggle={() => setWaOn(v => !v)} />
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>Marketing Emails</div>
                <div className={styles.settingSub}>Offers &amp; promotions</div>
              </div>
              <Toggle on={mktOn} onToggle={() => setMktOn(v => !v)} />
            </div>
          </div>

          {/* Account */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Account</div>
            </div>
            <div className={styles.settingRow} style={{ cursor: 'pointer' }}>
              <div className={styles.settingLabel}>Privacy Settings</div>
              <svg style={{ width: 13, height: 13, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div className={styles.settingRow} style={{ cursor: 'pointer', borderBottom: 'none' }}>
              <div className={styles.settingLabel} style={{ color: 'var(--danger)' }}>Delete Account</div>
              <svg style={{ width: 13, height: 13, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
