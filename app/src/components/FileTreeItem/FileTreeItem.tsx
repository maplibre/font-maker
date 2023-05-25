import React, { useEffect } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import styles from './FileTreeItem.module.css';
import './Tooltip.css';
import clsx from 'clsx';


interface Props {
    id: UniqueIdentifier;
    depth: number;
    indentationWidth: number;
    fileName: string;

    // tree item props
    disabled?: boolean;
    progress?: number; // 0..256
    tooltip?: string;

    // overlay props
    dragOverlay?: boolean;
    childCount?: number;
    overTrashBin?: boolean;
}

const animateLayoutChanges: AnimateLayoutChanges = (args) => (
    !(args.isSorting || args.wasDragging)
);

export function FileTreeItem(props: Props) {
    const {
        id,
        depth,
        indentationWidth,
        fileName,
        disabled,
        progress,
        tooltip,
        dragOverlay,
        childCount,
        overTrashBin,
    } = props;
    const {
        attributes,
        isDragging,
        isSorting,
        listeners,
        setDraggableNodeRef,
        setDroppableNodeRef,
        transform,
        transition,
    } = useSortable({ id, animateLayoutChanges, disabled });

    useEffect(() => {
        if (!dragOverlay) {
            return;
        }
        document.body.style.setProperty('cursor', 'grabbing');
        return () => {
            document.body.style.removeProperty('cursor');
        };
    }, [dragOverlay]);

    return (
        <li
            className={clsx(
                styles.FileTreeItem,
                dragOverlay && styles.dragOverlay,
                isDragging && styles.newPositionOutline,
                (isSorting || disabled) && styles.disabledInteraction,
                disabled && styles.disabled,
                overTrashBin && styles.overTrashBin,
            )}
            ref={setDroppableNodeRef}
            style={{
                '--indent': `${indentationWidth * depth}px`,
            } as React.CSSProperties}
            data-tooltip={tooltip}
        >
            <div
                className={styles.Draggable}
                ref={setDraggableNodeRef}
                style={{
                    transform: CSS.Translate.toString(transform),
                    transition,
                }}
                {...attributes}
                {...listeners}
                tabIndex={undefined} // reset unwanted attr from dnd
            >
                {overTrashBin ? (
                    <span className={styles.deletionWarning}>
                        Remove
                    </span>
                ) : null}
                <span>
                    {fileName}
                </span>
                {(progress !== undefined) ? (
                    <progress
                        value={progress}
                        max={256}
                        className={styles.ProgressBar}
                    />
                ) : null}
                {childCount ? (
                    <span className={styles.ChildrenCount}>
                        {childCount + 1}
                    </span>
                ) : null}
            </div>
        </li>
    );
}
