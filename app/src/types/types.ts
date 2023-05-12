import { EXAMPLES } from '../data/data.js';


export enum AppStatus {
    Ready = 'Ready',
    Running = 'Running',
    Finished = 'Finished',
}

export interface AppState {
    stacks: FontFileTreeItem[];
    status: AppStatus;
    config: MapConfig;
}

export interface MapConfig {
    font: string;
    fontSize: number;
    langCode: string;
    customText: string;
}


export interface TreeItem<T = unknown> {
    id: string;
    parent?: TreeItem<T>; // items under root do not have a parent
    children: TreeItem<T>[];
    data: T;
}

// tree flatten to an array
export interface FlattenedTreeItem<T = unknown> extends TreeItem<T> {
    depth: number;
}


export interface RenderedGlyphs {
    name: string;
    buffer: ArrayBuffer;
}

export interface FontFileData {
    file: File; // .otf,.ttf file
    stackName?: string;
    glyphs?: RenderedGlyphs[]; // 256 .pbf files
}

export type FontFileTreeItem = TreeItem<FontFileData>;


export type Example = typeof EXAMPLES[number];
