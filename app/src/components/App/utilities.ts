import type { Example, FontFileTreeItem } from '../../types/types.js';
import { buildTree, flattenTree } from '../FilesSection/utilities.js';


export function fileToFontStackTreeItem(file: File): FontFileTreeItem {
    return {
        id: Math.random().toString(36).slice(2, 7),
        parent: undefined,
        children: [],
        data: { file },
    };
}

export async function exampleToFontStackTreeItem(example: Example): Promise<FontFileTreeItem> {
    const [stack, ...children] = await Promise.all(
        example.files.map(fileName => (
            fetch(fileName)
                .then(resp => resp.blob())
                .then(blob => new File([blob], fileName))
                .then(fileToFontStackTreeItem)
        )),
    );
    return Object.assign(stack, {
        children: children.map(c => ({ ...c, parent: stack })),
    });
}

export function isStackConverted(stack: FontFileTreeItem) {
    return stack.data.glyphs?.length === 256;
}

export function resetFontStack(stack: FontFileTreeItem): FontFileTreeItem {
    const [cleared] = buildTree(
        flattenTree([stack])
            .map(item => ({
                ...item,
                data: { ...item.data, stackName: undefined, glyphs: undefined },
            })),
    );
    return cleared;
}
