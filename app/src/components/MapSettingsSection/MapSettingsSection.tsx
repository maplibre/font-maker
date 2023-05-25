import React from 'react';

import type { FontFileTreeItem, MapConfig } from '../../types/types.js';
import { RangeInput, Select, TextInput } from '../Inputs/Inputs.js';
import { DEFAULT_FONT, LANGUAGES } from '../../data/data.js';
import { isStackConverted } from '../App/utilities.js';

import styles from './MapSettingsSection.module.css';


interface Props {
    stacks: FontFileTreeItem[];
    mapConfig: MapConfig;
    onMapConfigChange: (changes: Partial<MapConfig>) => void;
}

export function MapSettingsSection(props: Props) {
    const { stacks, mapConfig, onMapConfigChange } = props;
    const convertedStacks = stacks.filter(isStackConverted);

    return (
        <ul className={styles.MapSettingSection}>
            <li>
                <label>
                    Font
                    <Select
                        value={mapConfig.font}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            onMapConfigChange({ font: e.target.value });
                        }}
                    >
                        <option value={DEFAULT_FONT}>{DEFAULT_FONT}</option>
                        {convertedStacks.map(({ id, data: { stackName } }) => (
                            <option key={id} value={id}>
                                {stackName}
                            </option>
                        ))}
                        <option disabled>Convert files to add more fonts</option>
                    </Select>
                </label>
            </li>
            <li>
                <label>
                    Language
                    <Select
                        value={mapConfig.langCode}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            onMapConfigChange({ langCode: e.target.value });
                        }}
                    >
                        {LANGUAGES.map(([code, label]) => (
                            <option key={code} value={code}>
                                {label}
                            </option>
                        ))}
                    </Select>
                </label>
            </li>
            <li>
                <label>
                    Custom text
                    <TextInput
                        type='search'
                        value={mapConfig.customText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            onMapConfigChange({ customText: e.target.value });
                        }}
                    />
                </label>
            </li>
            <li>
                <label>
                    Text Size <span className={styles.fontSizeValue}>{mapConfig.fontSize}px</span>
                    <RangeInput
                        min='8'
                        max='48'
                        value={mapConfig.fontSize}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            onMapConfigChange({ fontSize: +e.target.value });
                        }}
                    />
                </label>
            </li>
        </ul>
    );
}
