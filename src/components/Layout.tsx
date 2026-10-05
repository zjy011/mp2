import { Link, NavLink, Outlet, useMatch } from 'react-router-dom';
import { usePokemonData } from '../hooks/usePokemonData';
import { loadLastViewed } from '../lib/browseContext';
import DataBanner from './DataBanner';
import Logo from './Logo';
import styles from './Layout.module.css';

const SOURCE_LABEL = {
  network: 'Live · PokeAPI',
  cache: 'Cached · PokeAPI',
  mock: 'Offline sample',
} as const;

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;

export default function Layout() {
  const { source, status } = usePokemonData();
  const detailMatch = useMatch('/details/:id');
  const detailTarget = detailMatch?.params.id ?? String(loadLastViewed() ?? 1);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/list" className={styles.brand} aria-label="Dexplorer home">
            <Logo className={styles.logo} />
            <span className={styles.brandText}>
              Dex<span className={styles.brandAccent}>plorer</span>
            </span>
          </Link>

          <nav className={styles.nav} aria-label="Main">
            <NavLink to="/list" className={navClass}>
              List
            </NavLink>
            <NavLink to="/gallery" className={navClass}>
              Gallery
            </NavLink>
            <NavLink to={`/details/${detailTarget}`} className={navClass}>
              Detail
            </NavLink>
          </nav>

          {status === 'ready' && source && (
            <span className={`${styles.source} ${styles[source]}`}>{SOURCE_LABEL[source]}</span>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <DataBanner />
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>
          Data and artwork from{' '}
          <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">
            PokeAPI
          </a>
          . Pokémon and Pokémon character names are trademarks of Nintendo. Built for CS 409 MP2.
        </p>
      </footer>
    </div>
  );
}
