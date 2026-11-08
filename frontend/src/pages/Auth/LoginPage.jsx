import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api/client';
import { setToken, setUser } from '../../utils/auth';
import styles from './Auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      setToken(data.token);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (demoEmail, demoPwd) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email: demoEmail, password: demoPwd });
      setToken(data.token);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Subtle mesh overlay */}
      <div className={styles.mesh} aria-hidden="true" />

      <div className={styles.card}>
        {/* Logo mark */}
        <div className={styles.logoWrap}>
          <img src="/icons/logo-mark.png" alt="Courts logo" className={styles.logoImg} />
        </div>

        <h1 className={styles.title}>Courts</h1>
        <p className={styles.subtitle}>Book Smarter, Play Harder</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.group}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or try a demo account</span>
        </div>

        <div className={styles.demoBtns}>
          <button
            className={styles.demoBtn}
            onClick={() => demoLogin('test@courts.com', 'test123')}
            disabled={loading}
          >
            Customer
          </button>
          <button
            className={styles.demoBtn}
            onClick={() => demoLogin('vendor@courts.com', 'vendor123')}
            disabled={loading}
          >
            Vendor
          </button>
          <button
            className={styles.demoBtn}
            onClick={() => demoLogin('admin@courts.lk', 'admin123')}
            disabled={loading}
          >
            Admin
          </button>
        </div>

        <p className={styles.link}>
          New here? <Link to="/register" className={styles.linkAnchor}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
