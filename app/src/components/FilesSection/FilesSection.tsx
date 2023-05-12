import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import { closestCenter, defaultDropAnimation, DndContext, DragEndEvent, DragMoveEvent, DragOverEvent, DragOverlay, DragStartEvent, DropAnimation, MeasuringStrategy, PointerSensor, UniqueIdentifier, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { buildTree, countChildren, flattenTree, getItemById, getItemIndex, getOldestParent, getProjection, trimTree } from './utilities.js';
import { Button, ButtonProps, FileInput } from '../Inputs/Inputs.js';
import { FileTreeItem } from '../FileTreeItem/FileTreeItem.js';
import { AppStatus, FontFileTreeItem } from '../../types/types.js';

import styles from './FilesSection.module.css';
import clsx from 'clsx';


const measuring = {
    droppable: {
        strategy: MeasuringStrategy.Always,
    },
};

const dropAnimationConfig: DropAnimation = {
    keyframes({ transform }) {
        return [
            { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
            {
                opacity: 0,
                transform: CSS.Transform.toString({
                    ...transform.final,
                    x: transform.final.x + 5,
                    y: transform.final.y + 5,
                }),
            },
        ];
    },
    easing: 'ease-out',
    sideEffects({ active }) {
        active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: defaultDropAnimation.duration,
            easing: defaultDropAnimation.easing,
        });
    },
};


interface Props {
    status: AppStatus;
    stacks: FontFileTreeItem[];
    indentationWidth?: number;
    depthLimit?: number;
    onFilesUpload: (uploadedFiles: File[]) => void;
    onStacksChange: (newStacks: FontFileTreeItem[], modifiedStackIds?: string[]) => void;
    onConversionStart: () => void;
    onDownloadZip: () => void;
}

export function FilesSection(props: Props) {
    const {
        status,
        stacks,
        indentationWidth = 24,
        depthLimit = 1,
        onFilesUpload,
        onStacksChange,
        onConversionStart,
        onDownloadZip,
    } = props;
    const disabled = status === AppStatus.Running;

    // files dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        disabled,
        onDrop: onFilesUpload,
        accept: {
            'font/otf': ['.otf'],
            'font/ttf': ['.ttf'],
        },
        multiple: true,
        noClick: true,
        noKeyboard: true,
    });

    // files tree
    const [activeId, setActiveId] = useState<UniqueIdentifier>();
    const [overId, setOverId] = useState<UniqueIdentifier>();
    const [offsetLeft, setOffsetLeft] = useState(0);

    const flattenedItems = useMemo(() => (
        Array.from(flattenTree(stacks, activeId ? [activeId] : []))
    ), [activeId, stacks]);

    const activeItem = activeId
        ? getItemById(flattenedItems, activeId)
        : undefined;
    const projected = (activeId && overId)
        ? getProjection(flattenedItems, activeId, overId, offsetLeft, indentationWidth, depthLimit)
        : undefined;

    const sensors = useSensors(useSensor(PointerSensor));
    const sortedIds = useMemo(() => flattenedItems.map(({ id }) => id), [flattenedItems]);

    return (
        <ul
            {...getRootProps()} // files dropzone
            className={clsx(
                styles.FilesSection,
                isDragActive && styles.UploadFilesDropzoneActive,
            )}
        >
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                measuring={measuring}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <li className={styles.FilesSectionHeader}>
                    <FileInput
                        {...getInputProps({
                            tabIndex: undefined, // reset unwanted attrs from react-dropzone
                            style: undefined,
                        })}
                        disabled={disabled}
                        title={`Loaded ${stacks.length} font stacks`}
                        value='' // to allow the same file to be uploaded multiple times
                    />
                    <ClearButton
                        outline
                        className={styles.ClearButton}
                        data-hidden={!stacks.length}
                        disabled={!stacks.length || disabled}
                        title='Clear all files'
                        onClick={() => onStacksChange([])}
                    >
                        Clear
                    </ClearButton>
                </li>
                <SortableContext
                    items={sortedIds}
                    strategy={verticalListSortingStrategy}
                    disabled={disabled}
                >
                    {flattenedItems.map(({ id, depth, data }) => (
                        <FileTreeItem
                            key={id}
                            id={id}
                            depth={((id === activeId) && projected) ? projected.depth : depth}
                            indentationWidth={indentationWidth}
                            fileName={data.file.name}
                            disabled={disabled}
                            progress={disabled ? data.glyphs?.length : undefined}
                            tooltip={
                                (disabled && data.glyphs)
                                    ? [
                                        data.stackName,
                                        `${data.glyphs.length} / 256 files generated`,
                                    ].filter(Boolean).join('\u000D\u000A') // \n for "tooltips"
                                    : undefined
                            }
                        />
                    ))}
                    {createPortal(
                        <DragOverlay dropAnimation={dropAnimationConfig}>
                            {activeItem ? (
                                <FileTreeItem
                                    id={activeItem.id}
                                    depth={activeItem.depth}
                                    indentationWidth={indentationWidth}
                                    fileName={activeItem.data.file.name}
                                    dragOverlay
                                    childCount={countChildren(activeItem.children)}
                                    overTrashBin={overId === TRASH_ID}
                                />
                            ) : null}
                        </DragOverlay>,
                        document.body,
                    )}
                </SortableContext>
                <li className={clsx(styles.FilesSectionFooter)}>
                    {status === AppStatus.Ready ? (
                        <Button
                            className={styles.importantButton}
                            disabled={!stacks.length}
                            onClick={onConversionStart}
                        >
                            Convert
                        </Button>
                    ) : (
                        <Button
                            className={clsx(
                                styles.importantButton,
                                (status === AppStatus.Running) && styles.loading,
                            )}
                            disabled={status !== AppStatus.Finished}
                            onClick={onDownloadZip}
                        >
                            Download .zip
                        </Button>
                    )}
                </li>
            </DndContext>
        </ul>
    );

    function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
        setActiveId(activeId);
        setOverId(activeId);
    }

    function handleDragMove({ delta }: DragMoveEvent) {
        setOffsetLeft(delta.x);
    }

    function handleDragOver({ over }: DragOverEvent) {
        setOverId(over?.id);
    }

    function handleDragEnd({ active, over }: DragEndEvent) {
        resetState();

        if (over?.id === TRASH_ID) {
            const withoutActive = Array
                .from(flattenTree(stacks, [active.id]))
                .filter(item => item.id !== active.id);
            return onStacksChange(buildTree(withoutActive));
        }

        if (projected && over) {
            const clonedItems = Array.from(flattenTree(stacks));
            const overIndex = getItemIndex(clonedItems, over.id);
            const activeIndex = getItemIndex(clonedItems, active.id);
            const activeItem = clonedItems[activeIndex];

            if ((overIndex !== activeIndex) || (activeItem.parent?.id !== projected.parent?.id)) {
                const modifiedStackIds = [
                    getOldestParent(activeItem)!.id, // old stack
                    getOldestParent(projected.parent)?.id!, // new stack
                ];

                activeItem.parent = projected.parent?.id
                    ? getItemById(clonedItems, projected.parent?.id)
                    : undefined;
                const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

                const newItems = buildTree(sortedItems);
                trimTree(newItems, depthLimit);
                return onStacksChange(newItems, modifiedStackIds);
            }
        }
    }

    function handleDragCancel() {
        resetState();
    }

    function resetState() {
        setOverId(undefined);
        setActiveId(undefined);
        setOffsetLeft(0);
    }
}


const TRASH_ID = 'trash';

function ClearButton(props: ButtonProps) {
    const { setNodeRef, isOver } = useDroppable({ id: TRASH_ID });
    return <Button ref={setNodeRef} {...props} data-remove-file={isOver} />;
}
