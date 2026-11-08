import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api/client';
import { setToken, setUser } from '../../utils/auth';
import { validateRegister } from '../../utils/validators';
import styles from './Auth.module.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', password: '', role: 'customer' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validateErrors = validateRegister(formData);
    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.register(formData);
      setToken(data.token);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mesh} aria-hidden="true" />

      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <img src="/icons/logo-mark.png" alt="Courts logo" className={styles.logoImg} />
        </div>

        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join Courts — Sri Lanka's #1 futsal platform</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.group}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Kasun Perera"
              className={styles.input}
              disabled={loading}
            />
            {errors.full_name && <span className={styles.fieldError}>{errors.full_name}</span>}
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={styles.input}
              disabled={loading}
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Phone <span className={styles.optional}>(optional)</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+94 77 123 4567"
              className={styles.input}
              disabled={loading}
            />
            {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={styles.input}
              disabled={loading}
            />
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <div className={styles.group}>
            <label className={styles.label}>I am a</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.input}
              disabled={loading}
            >
              <option value="customer">Customer — I want to book courts</option>
              <option value="vendor">Vendor — I own / manage courts</option>
            </select>
          </div>

          {errors.submit && <p className={styles.errorMsg}>{errors.submit}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.link}>
          Already have an account?{' '}
          <Link to="/login" className={styles.linkAnchor}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
