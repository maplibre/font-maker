import { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import type { FlattenedTreeItem, TreeItem } from '../../types/types.js';


export function getProjection<T>(
    items: FlattenedTreeItem<T>[],
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
    dragOffset: number,
    indentationWidth: number,
    depthLimit: number,
): { depth: number, parent?: TreeItem<T> } {
    const overItemIndex = items.findIndex(byId(overId));
    const activeItemIndex = items.findIndex(byId(activeId));
    const activeItem = items[activeItemIndex];
    const newItems = arrayMove(items, activeItemIndex, overItemIndex);
    const prevItem = newItems[overItemIndex - 1];
    const nextItem = newItems[overItemIndex + 1];

    const dragDepth = Math.round(dragOffset / indentationWidth);
    const projectedDepth = activeItem.depth + dragDepth;
    const minDepth = nextItem?.depth ?? 0;
    const maxDepth = Math.min((prevItem?.depth ?? -1) + 1, depthLimit);
    const depth = Math.min(Math.max(projectedDepth, minDepth), maxDepth);

    const parent = function getProjectedParent() {
        if (depth) {
            for (let i = overItemIndex - 1; i >= 0; i--) {
                const item = newItems[i];
                if (depth > item.depth) {
                    return item;
                }
                if (depth === item.depth) {
                    return item.parent;
                }
            }
        }
    }();

    return { depth, parent };
}

export function getOldestParent<T>(item: TreeItem<T> | undefined): TreeItem<T> | undefined {
    if (!item?.parent) {
        return item;
    }
    return getOldestParent(item.parent);
}

function* treeIterator<T>(
    items: TreeItem<T>[],
    itemIdsWithChildrenToOmit?: UniqueIdentifier[],
    depth = 0,
): Generator<FlattenedTreeItem<T>> {
    for (const item of items) {
        yield { ...item, depth };
        if (!itemIdsWithChildrenToOmit?.includes(item.id)) {
            yield* treeIterator(item.children, itemIdsWithChildrenToOmit, depth + 1);
        }
    }
}

export function flattenTree<T>(
    items: TreeItem<T>[],
    itemIdsWithChildrenToOmit?: UniqueIdentifier[],
): FlattenedTreeItem<T>[] {
    return Array.from(treeIterator(items, itemIdsWithChildrenToOmit));
}

export function byId<T extends {
    id: UniqueIdentifier
}>(id: UniqueIdentifier): (item: T) => boolean {
    return item => item.id === id;
}

export function countChildren<T>(items: TreeItem<T>[], count = 0): number {
    return items.reduce((acc, item) => (
        countChildren(item.children, acc + 1)
    ), count);
}

export function buildTree<T>(flattenedItems: FlattenedTreeItem<T>[]): TreeItem<T>[] {
    const root = { children: [] } as unknown as TreeItem<T>;
    const itemsMap = new Map<string, TreeItem<T>>(
        flattenedItems.map(item => [item.id, { ...item, children: [] }]),
    );

    for (const item of itemsMap.values()) {
        const parent = itemsMap.get(item.parent?.id!);
        item.parent = parent;
        (parent || root).children.push(item);
    }

    return root.children;
}

export function trimTree<T>(
    items: TreeItem<T>[],
    depthLimit: number,
    parents: TreeItem<T>[] = [{ children: items } as TreeItem<T>],
): TreeItem<T>[] {
    if (!items.length) {
        return items;
    }

    for (const item of items) {
        if (item.children.length && (parents.length > depthLimit)) {
            const [parent] = parents;
            const flattenItemWithDescendants = flattenTree([item])
                .map(item => ({ ...item, parent, children: [] }));
            const itemSiblings = parent.children;
            const itemIndex = itemSiblings.findIndex(byId(item.id));
            itemSiblings.splice(itemIndex, 1, ...flattenItemWithDescendants); // mutation
        } else {
            trimTree(item.children, depthLimit, [item, ...parents]);
        }
    }

    return items;
}
