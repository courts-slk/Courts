import Sidebar from '../Sidebar/Sidebar';
import TopBar from '../TopBar/TopBar';
import MobileNav from '../MobileNav/MobileNav';
import styles from './AppShell.module.css';

export default function AppShell({ children }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.content}>
        <TopBar />
        <main className={styles.main}>
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
