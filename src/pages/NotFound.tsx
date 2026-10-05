import { Link } from 'react-router-dom';
import StatusView from '../components/StatusView';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <StatusView
      kind="empty"
      title="This route ran away"
      message="The page you’re looking for doesn’t exist. Head back to the list or browse the gallery."
      action={
        <div className={styles.actions}>
          <Link to="/list" className={styles.primary}>
            Open the list
          </Link>
          <Link to="/gallery" className={styles.secondary}>
            Browse the gallery
          </Link>
        </div>
      }
    />
  );
}
