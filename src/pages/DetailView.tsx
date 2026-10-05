import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePokemonData } from '../hooks/usePokemonData';
import { useAsync } from '../hooks/useAsync';
import { fetchEvolutionChain, fetchPokemon, fetchSpecies } from '../api/pokemon';
import { browseFromState, loadBrowse, saveBrowse, saveLastViewed } from '../lib/browseContext';
import type { BrowseContext, DetailLocationState } from '../lib/browseContext';
import { dexNumber, formatGender, formatGeneration, formatHeight, formatWeight, titleCase } from '../lib/format';
import type { PokemonSummary } from '../types/pokemon';
import TypeBadge from '../components/TypeBadge';
import StatBars from '../components/StatBars';
import EvolutionChain from '../components/EvolutionChain';
import StatusView from '../components/StatusView';
import styles from './DetailView.module.css';

function parseId(raw: string | undefined): number | null {
  if (!raw || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return id > 0 ? id : null;
}

/** Picks the result set prev/next should walk: router state, then session, then the whole dex. */
function resolveBrowse(state: unknown, id: number, all: PokemonSummary[]): BrowseContext {
  const fromState = browseFromState(state);
  if (fromState?.ids.includes(id)) return fromState;
  const stored = loadBrowse();
  if (stored?.ids.includes(id)) return stored;
  return {
    ids: all.map((p) => p.id),
    label: 'All Pokémon · Dex order',
    returnTo: '/list',
    origin: 'all',
  };
}

export default function DetailView() {
  const { id: idParam } = useParams();
  const id = parseId(idParam);
  const location = useLocation();
  const navigate = useNavigate();
  const { status: dexStatus, pokemon, byId } = usePokemonData();
  const [attempt, setAttempt] = useState(0);

  // ---------- Browse context for prev / next ----------
  const browse = useMemo(
    () => (id === null ? null : resolveBrowse(location.state, id, pokemon)),
    [location.state, id, pokemon],
  );
  const linkState = useMemo<DetailLocationState | undefined>(() => (browse ? { browse } : undefined), [browse]);
  const index = browse && id !== null ? browse.ids.indexOf(id) : -1;
  const prevId = browse && index > 0 ? browse.ids[index - 1] : null;
  const nextId = browse && index >= 0 && index < browse.ids.length - 1 ? browse.ids[index + 1] : null;

  useEffect(() => {
    if (id === null) return;
    saveLastViewed(id);
    const fromState = browseFromState(location.state);
    if (fromState) saveBrowse(fromState);
  }, [id, location.state]);

  // Arrow keys step through the result set.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, select, textarea')) return;
      const dest = e.key === 'ArrowLeft' ? prevId : e.key === 'ArrowRight' ? nextId : null;
      if (dest !== null) navigate(`/details/${dest}`, { state: linkState });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevId, nextId, linkState, navigate]);

  // ---------- Data ----------
  const cached = id !== null ? byId.get(id) : undefined;
  // Ids outside the preloaded dex (e.g. /details/250) are fetched individually.
  const summaryState = useAsync(
    id !== null && dexStatus === 'ready' && !cached ? `pokemon:${id}:${attempt}` : null,
    () => fetchPokemon(id ?? 0),
  );
  const summary = cached ?? (summaryState.status === 'success' ? summaryState.data : null);

  const speciesState = useAsync(id !== null ? `species:${id}:${attempt}` : null, () => fetchSpecies(id ?? 0));
  const species = speciesState.status === 'success' ? speciesState.data : null;

  const chainUrl = species?.evolutionChainUrl ?? null;
  const evolutionState = useAsync(chainUrl ? `evo:${chainUrl}:${attempt}` : null, () =>
    chainUrl ? fetchEvolutionChain(chainUrl) : Promise.resolve([]),
  );

  const backLabel =
    browse?.origin === 'gallery' ? 'Back to gallery' : browse?.origin === 'list' ? 'Back to results' : 'Back to list';

  // ---------- Early states ----------
  if (id === null) {
    return (
      <StatusView
        kind="error"
        title="That isn’t a valid Pokémon id"
        message={`“${idParam ?? ''}” is not a dex number. Detail pages look like /details/25.`}
        action={
          <Link to="/list" className={styles.button}>
            Go to the list
          </Link>
        }
      />
    );
  }

  if (!summary) {
    if (summaryState.status === 'error') {
      return (
        <StatusView
          kind="error"
          title={`Couldn’t load Pokémon ${dexNumber(id)}`}
          message={summaryState.error}
          action={
            <div className={styles.actions}>
              <button type="button" className={styles.button} onClick={() => setAttempt((n) => n + 1)}>
                Try again
              </button>
              <Link to="/list" className={styles.ghostButton}>
                Back to list
              </Link>
            </div>
          }
        />
      );
    }
    return <StatusView kind="loading" title={`Loading ${dexNumber(id)}…`} />;
  }

  const prev = prevId !== null ? byId.get(prevId) : undefined;
  const next = nextId !== null ? byId.get(nextId) : undefined;
  const primaryType = summary.types[0];

  return (
    <div className={styles.page} data-type={primaryType}>
      {/* ---------- Top bar: back + position + prev/next ---------- */}
      <nav className={styles.topbar} aria-label="Result navigation">
        <Link to={browse?.returnTo ?? '/list'} className={styles.back}>
          <span aria-hidden="true">←</span> {backLabel}
        </Link>

        <div className={styles.position}>
          {index >= 0 && browse ? (
            <>
              <strong>
                {index + 1} / {browse.ids.length}
              </strong>
              <span className={styles.positionLabel}>{browse.label}</span>
            </>
          ) : (
            <span className={styles.positionLabel}>Not in the current result set</span>
          )}
        </div>

        <div className={styles.arrows}>
          <PagerArrow direction="prev" targetId={prevId} state={linkState} />
          <PagerArrow direction="next" targetId={nextId} state={linkState} />
        </div>
      </nav>

      {/* ---------- Hero ---------- */}
      <article className={styles.hero}>
        <div className={styles.artPanel}>
          <span className={styles.bigNumber} aria-hidden="true">
            {dexNumber(summary.id)}
          </span>
          <img
            key={summary.id}
            src={summary.artwork}
            alt={`Official artwork of ${titleCase(summary.name)}`}
            className={styles.art}
            width={475}
            height={475}
          />
        </div>

        <div className={styles.heroText}>
          <p className={styles.number}>{dexNumber(summary.id)}</p>
          <h1 className={styles.name}>{titleCase(summary.name)}</h1>
          <p className={styles.genus}>
            {species?.genus ?? (speciesState.status === 'error' ? 'Pokémon' : '…')}
            {species?.isLegendary && <span className={styles.tag}>Legendary</span>}
            {species?.isMythical && <span className={styles.tag}>Mythical</span>}
          </p>
          <div className={styles.types}>
            {summary.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>

          <blockquote className={styles.flavor}>
            {species
              ? species.flavorText
              : speciesState.status === 'error'
                ? 'The Pokédex entry could not be loaded.'
                : 'Loading Pokédex entry…'}
          </blockquote>

          <dl className={styles.quickFacts}>
            <div>
              <dt>Height</dt>
              <dd>{formatHeight(summary.height)}</dd>
            </div>
            <div>
              <dt>Weight</dt>
              <dd>{formatWeight(summary.weight)}</dd>
            </div>
            <div>
              <dt>Base XP</dt>
              <dd>{summary.baseExperience}</dd>
            </div>
            <div>
              <dt>Stat total</dt>
              <dd>{summary.total}</dd>
            </div>
          </dl>
        </div>
      </article>

      {/* ---------- Stats + profile ---------- */}
      <div className={styles.columns}>
        <section className={styles.card} aria-labelledby="stats-heading">
          <h2 id="stats-heading" className={styles.cardTitle}>
            Base stats
          </h2>
          <StatBars stats={summary.stats} total={summary.total} />
        </section>

        <section className={styles.card} aria-labelledby="profile-heading">
          <h2 id="profile-heading" className={styles.cardTitle}>
            Profile
          </h2>
          <dl className={styles.profile}>
            <div>
              <dt>Abilities</dt>
              <dd className={styles.abilities}>
                {summary.abilities.map((a) => (
                  <span key={a.name} className={a.hidden ? `${styles.ability} ${styles.hidden}` : styles.ability}>
                    {titleCase(a.name)}
                    {a.hidden && <small> hidden</small>}
                  </span>
                ))}
              </dd>
            </div>
            {species ? (
              <>
                <div>
                  <dt>Habitat</dt>
                  <dd>{species.habitat ? titleCase(species.habitat) : 'Unknown'}</dd>
                </div>
                <div>
                  <dt>Introduced</dt>
                  <dd>{formatGeneration(species.generation)}</dd>
                </div>
                <div>
                  <dt>Capture rate</dt>
                  <dd>{species.captureRate} / 255</dd>
                </div>
                <div>
                  <dt>Base friendship</dt>
                  <dd>{species.baseHappiness ?? 'Unknown'}</dd>
                </div>
                <div>
                  <dt>Growth rate</dt>
                  <dd>{titleCase(species.growthRate)}</dd>
                </div>
                <div>
                  <dt>Egg groups</dt>
                  <dd>{species.eggGroups.map(titleCase).join(', ') || 'None'}</dd>
                </div>
                <div>
                  <dt>Gender</dt>
                  <dd>{formatGender(species.genderRate)}</dd>
                </div>
                <div>
                  <dt>Colour</dt>
                  <dd>{titleCase(species.color)}</dd>
                </div>
              </>
            ) : (
              <div className={styles.profileNote}>
                {speciesState.status === 'error' ? (
                  <>
                    Species details unavailable: {speciesState.error}{' '}
                    <button type="button" className={styles.inlineButton} onClick={() => setAttempt((n) => n + 1)}>
                      Retry
                    </button>
                  </>
                ) : (
                  'Loading species details…'
                )}
              </div>
            )}
          </dl>
        </section>
      </div>

      {/* ---------- Evolution ---------- */}
      <section className={styles.card} aria-labelledby="evo-heading">
        <h2 id="evo-heading" className={styles.cardTitle}>
          Evolution
        </h2>
        {evolutionState.status === 'success' && linkState ? (
          <EvolutionChain nodes={evolutionState.data} currentId={summary.id} linkState={linkState} />
        ) : evolutionState.status === 'error' || speciesState.status === 'error' ? (
          <p className={styles.muted}>The evolution chain could not be loaded.</p>
        ) : (
          <p className={styles.muted}>Loading evolution chain…</p>
        )}
      </section>

      {/* ---------- Bottom pager ---------- */}
      <nav className={styles.pager} aria-label="Previous and next Pokémon">
        <PagerCard direction="prev" targetId={prevId} target={prev} state={linkState} />
        <PagerCard direction="next" targetId={nextId} target={next} state={linkState} />
      </nav>
      <p className={styles.hint}>Tip: use the ← and → keys to move through results.</p>
    </div>
  );
}

// ---------- Pager pieces ----------

interface PagerProps {
  direction: 'prev' | 'next';
  targetId: number | null;
  state: DetailLocationState | undefined;
}

function PagerArrow({ direction, targetId, state }: PagerProps) {
  const label = direction === 'prev' ? 'Previous Pokémon' : 'Next Pokémon';
  const glyph = direction === 'prev' ? '‹' : '›';
  if (targetId === null) {
    return (
      <span
        className={`${styles.arrow} ${styles.disabled}`}
        aria-disabled="true"
        title={`No ${direction === 'prev' ? 'previous' : 'next'} result`}
      >
        <span aria-hidden="true">{glyph}</span>
        <span className="visually-hidden">{label} (none)</span>
      </span>
    );
  }
  return (
    <Link to={`/details/${targetId}`} state={state} className={styles.arrow} aria-label={label} title={label}>
      <span aria-hidden="true">{glyph}</span>
    </Link>
  );
}

function PagerCard({ direction, targetId, target, state }: PagerProps & { target: PokemonSummary | undefined }) {
  const caption = direction === 'prev' ? 'Previous' : 'Next';
  const className = `${styles.pagerCard} ${direction === 'next' ? styles.pagerNext : ''}`;

  if (targetId === null) {
    return (
      <span className={`${className} ${styles.disabled}`} aria-disabled="true">
        <span className={styles.pagerCaption}>{caption}</span>
        <span className={styles.pagerName}>{direction === 'prev' ? 'Start of results' : 'End of results'}</span>
      </span>
    );
  }

  return (
    <Link to={`/details/${targetId}`} state={state} className={className} data-type={target?.types[0]}>
      <span className={styles.pagerArrowGlyph} aria-hidden="true">
        {direction === 'prev' ? '←' : '→'}
      </span>
      {target && <img src={target.sprite} alt="" className={styles.pagerSprite} width={96} height={96} />}
      <span className={styles.pagerText}>
        <span className={styles.pagerCaption}>{caption}</span>
        <span className={styles.pagerName}>
          {dexNumber(targetId)} {target ? titleCase(target.name) : ''}
        </span>
      </span>
    </Link>
  );
}
