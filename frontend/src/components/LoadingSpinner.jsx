import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}
