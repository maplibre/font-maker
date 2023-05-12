import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import maplibregl, { RequestParameters, ResponseCallback } from 'maplibre-gl';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import type { Example, FontFileTreeItem, MapConfig } from '../../types/types.js';
import { DEFAULT_FONT } from '../../data/data.js';
import { exampleToFontStackTreeItem, fileToFontStackTreeItem, isStackConverted } from './utilities.js';
import { flattenTree } from '../FilesSection/utilities.js';
import { appReducer, initialState, WebWorkerDataPackage } from './appReducer.js';
import { PermittedGitHubLogo } from '../PermittedGitHubLogo/PermittedGitHubLogo.js';
import { ExamplesSection } from '../ExamplesSection/ExamplesSection.js';
import { FilesSection } from '../FilesSection/FilesSection.js';
import { MapSettingsSection } from '../MapSettingsSection/MapSettingsSection.js';
import { MapPreview } from '../MapPreview/MapPreview.js';

import styles from './App.module.css';


const worker = new Worker('worker.js');

export function App() {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { status, stacks, config } = state;

    // make the state accessible in protocol hook.
    const stacksRef = useRef(stacks);
    stacksRef.current = stacks;

    useEffect(() => {
        worker.onmessage = function (message: MessageEvent<WebWorkerDataPackage>) {
            dispatch({ type: 'updateConversionStatus', data: message.data });
        };

        maplibregl.addProtocol(
            'memfont',
            (params: RequestParameters, callback: ResponseCallback<any>) => {
                const re = new RegExp(/memfont:\/\/(.+)\/(\d+)-(\d+)\.pbf/);
                const urlMatch = params.url.match(re);
                if (urlMatch) {
                    const [_, fontId, rangeStart, rangeEnd] = urlMatch;
                    const rangeName = `${rangeStart}-${rangeEnd}.pbf`;
                    if (fontId === DEFAULT_FONT) {
                        fetch(`https://demotiles.maplibre.org/font/${fontId}/${rangeName}`)
                            .then(resp => resp.arrayBuffer())
                            .then(ab => callback(null, new Uint8Array(ab), null, null));
                    } else {
                        const matchingRange = stacksRef.current
                            .find(stack => stack.id === fontId)?.data.glyphs
                            ?.find(glyph => glyph.name === rangeName);
                        setTimeout(() => {
                            if (!matchingRange) throw Error(`Can't find range "${params.url}"`);
                            callback(null, new Uint8Array(matchingRange.buffer), null, null);
                        }, 0);
                    }
                }
                return {
                    cancel: () => {},
                };
            },
        );

        return () => {
            worker.onmessage = null;
            maplibregl.removeProtocol('memfont');
        };
    }, []);

    const handle = useMemo(() => ({
        exampleLoad: async (example: Example) => {
            const loadedExample = await exampleToFontStackTreeItem(example);
            dispatch({ type: 'addFontStacks', stacks: [loadedExample] });
        },
        fontFilesUpload: (uploadedFiles: File[]) => {
            if (uploadedFiles.length) {
                const asFontStackItems = uploadedFiles
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(fileToFontStackTreeItem);
                dispatch({ type: 'addFontStacks', stacks: asFontStackItems });
            }
        },
        fontStacksChange: (newStacks: FontFileTreeItem[], modifiedStackIds?: string[]) => {
            dispatch({ type: 'setFontStacks', stacks: newStacks, modifiedStackIds });
        },
        mapConfigChange: (changes: Partial<MapConfig>) => {
            dispatch({ type: 'updateMapConfig', changes });
        },
    }), []);

    async function startFilesConversion() {
        const toConvert = stacks
            .filter(stack => !isStackConverted(stack));
        dispatch({ type: 'startConversion', toConvert });

        for (const stack of toConvert) {
            const stackFiles = flattenTree([stack]);
            const buffers = await Promise.all(
                stackFiles.map(item => item.data.file.arrayBuffer()),
            );
            worker.postMessage({ stackId: stack.id, buffers }, buffers);
        }
    }

    async function downloadZip() {
        const zip = new JSZip();
        for (const { data: { stackName, glyphs } } of stacks) {
            const folder = zip.folder(stackName!)!;
            for (const { name, buffer } of glyphs!) {
                folder.file(name, buffer);
            }
        }
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `font-maker-${new Date().toISOString()}.zip`);
    }

    return (
        <main className={styles.FullPage}>
            <aside className={styles.SideDrawer}>
                <header>
                    <h1>
                        <a href='/font-maker' target='_blank'>
                            Font Maker
                        </a>
                    </h1>
                    <a href='https://github.com/maplibre/font-maker' target='_blank'>
                        <PermittedGitHubLogo />
                    </a>
                </header>

                <section className={styles.SectionWrapper}>
                    <h2>Load Examples</h2>
                    <ExamplesSection
                        status={status}
                        onExampleLoad={handle.exampleLoad}
                    />
                </section>

                <section className={styles.SectionWrapper}>
                    <h2>Convert .otf or .ttf files</h2>
                    <FilesSection
                        status={status}
                        stacks={stacks}
                        onFilesUpload={handle.fontFilesUpload}
                        onStacksChange={handle.fontStacksChange}
                        onConversionStart={startFilesConversion}
                        onDownloadZip={downloadZip}
                    />
                </section>

                <section className={styles.SectionWrapper}>
                    <h2>Map settings</h2>
                    <MapSettingsSection
                        stacks={stacks}
                        mapConfig={config}
                        onMapConfigChange={handle.mapConfigChange}
                    />
                </section>
            </aside>
            <div className={styles.MapPreview}>
                <MapPreview mapConfig={config} />
            </div>
        </main>
    );
}
