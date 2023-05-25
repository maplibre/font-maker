import type { AppState, FontFileTreeItem, MapConfig, RenderedGlyphs } from '../../types/types.js';
import { AppStatus } from '../../types/types.js';
import { DEFAULT_FONT } from '../../data/data.js';
import { isStackConverted, resetFontStack } from './utilities.js';


export type AppAction =
    | { type: 'addFontStacks'; stacks: FontFileTreeItem[]; }
    | { type: 'setFontStacks'; stacks: FontFileTreeItem[]; modifiedStackIds?: string[]; }
    | { type: 'startConversion'; toConvert: FontFileTreeItem[]; }
    | { type: 'updateConversionStatus'; data: WebWorkerDataPackage; }
    | { type: 'updateMapConfig'; changes: Partial<MapConfig>; };

export interface WebWorkerDataPackage {
    stackId: string;
    stackName: string;
    glyph: RenderedGlyphs;
}


export const initialState: AppState = {
    stacks: [],
    status: AppStatus.Ready,
    config: {
        font: DEFAULT_FONT,
        fontSize: 14,
        langCode: 'name',
        customText: '',
    },
};

export function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {

        case 'addFontStacks': {
            return {
                ...state,
                status: AppStatus.Ready,
                stacks: [...state.stacks, ...action.stacks],
            };
        }

        case 'setFontStacks': {
            const newStacks = action.stacks.map(stack => (
                action.modifiedStackIds?.includes(stack.id)
                    ? resetFontStack(stack)
                    : stack
            ));
            const convertedStacks = newStacks.filter(isStackConverted);
            const activeFont = convertedStacks.some(stack => stack.id === state.config.font)
                ? state.config.font
                : convertedStacks.at(-1)?.id || DEFAULT_FONT;
            return {
                ...state,
                status: (newStacks.length && newStacks.every(isStackConverted))
                    ? AppStatus.Finished
                    : AppStatus.Ready,
                stacks: newStacks,
                config: (state.config.font !== activeFont)
                    ? { ...state.config, font: activeFont }
                    : state.config,
            };
        }

        case 'startConversion': {
            return {
                ...state,
                status: action.toConvert.length
                    ? AppStatus.Running
                    : AppStatus.Finished,
                stacks: state.stacks.map(stack => {
                    if (action.toConvert.includes(stack)) {
                        return { ...stack, data: { ...stack.data, glyphs: [] } };
                    }
                    return stack;
                }),
            };
        }

        case 'updateConversionStatus': {
            const { stackId, stackName, glyph } = action.data;
            let setAsNewActiveFont = false;
            const updatedStacks = state.stacks.map(stack => {
                if (stack.id === stackId) {
                    const glyphs = [...stack.data.glyphs!, glyph];
                    const updated = {
                        ...stack,
                        data: { ...stack.data, stackName, glyphs },
                    };
                    setAsNewActiveFont = isStackConverted(updated);
                    return updated;
                }
                return stack;
            });
            return {
                ...state,
                status: updatedStacks.every(isStackConverted)
                    ? AppStatus.Finished
                    : AppStatus.Running,
                stacks: updatedStacks,
                config: setAsNewActiveFont
                    ? { ...state.config, font: stackId }
                    : state.config,
            };
        }

        case 'updateMapConfig': {
            return {
                ...state,
                config: { ...state.config, ...action.changes },
            };
        }

        default:
            return state;

    }
}
