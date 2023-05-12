import React from 'react';

import type { Example } from '../../types/types.js';
import { AppStatus } from '../../types/types.js';
import { EXAMPLES } from '../../data/data.js';

import styles from './ExamplesSection.module.css';


interface Props {
    status: AppStatus;
    onExampleLoad: (example: Example) => void;
}

export function ExamplesSection({ status, onExampleLoad }: Props) {
    return (
        <ul>
            {EXAMPLES.map(example => (
                <li key={example.name} className={styles.ExampleItem}>
                    <button
                        disabled={status === AppStatus.Running}
                        onClick={() => onExampleLoad(example)}
                    >
                        {example.name}
                    </button>
                </li>
            ))}
        </ul>
    );
}
