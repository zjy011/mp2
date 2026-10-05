import { Link } from 'react-router-dom';
import type { EvolutionNode } from '../types/pokemon';
import type { DetailLocationState } from '../lib/browseContext';
import { artworkUrl } from '../api/pokemon';
import { dexNumber, titleCase } from '../lib/format';
import styles from './EvolutionChain.module.css';

interface EvolutionChainProps {
  nodes: EvolutionNode[];
  currentId: number;
  linkState: DetailLocationState;
}

export default function EvolutionChain({ nodes, currentId, linkState }: EvolutionChainProps) {
  if (nodes.length <= 1) {
    return <p className={styles.none}>This Pokémon does not evolve.</p>;
  }

  // Group by stage so branching evolutions (e.g. Eevee) stack vertically.
  const stages: EvolutionNode[][] = [];
  for (const node of nodes) (stages[node.depth] ??= []).push(node);

  return (
    <ol className={styles.chain}>
      {stages.map((stage, depth) => (
        <li key={depth} className={styles.stage}>
          {stage.map((node) => (
            <div key={node.id} className={styles.step}>
              {node.condition && (
                <span className={styles.condition}>
                  <span aria-hidden="true">→</span> {titleCase(node.condition.replace(/ /g, '-'))}
                </span>
              )}
              <Link
                to={`/details/${node.id}`}
                state={linkState}
                className={node.id === currentId ? `${styles.node} ${styles.current}` : styles.node}
                aria-current={node.id === currentId ? 'page' : undefined}
              >
                <img src={artworkUrl(node.id)} alt="" className={styles.art} loading="lazy" width={96} height={96} />
                <span className={styles.number}>{dexNumber(node.id)}</span>
                <span className={styles.name}>{titleCase(node.name)}</span>
              </Link>
            </div>
          ))}
        </li>
      ))}
    </ol>
  );
}
