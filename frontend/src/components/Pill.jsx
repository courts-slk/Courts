import styles from './Pill.module.css';

/**
 * color: 'green' | 'yellow' | 'red' | 'blue' | 'gray'
 */
export default function Pill({ color = 'gray', children }) {
  return (
    <span className={`${styles.pill} ${styles[color]}`}>
      <span className={styles.dot} />
      {children}
    </span>
  );
}
