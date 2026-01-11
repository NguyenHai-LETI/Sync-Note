import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Plus, CheckSquare, Square, GripVertical, Bold, Italic, Palette, X, Check } from 'lucide-react';
import { SyncService } from '../services/SyncService';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface SortableItemProps {
    item: any;
    toggleItem: (id: string, currentStatus: boolean, e: React.MouseEvent) => void;
    deleteItem: (id: string, e: React.MouseEvent) => void;
    saveItem: (id: string, newTitle: string) => void;
}

const SortableItem = ({ item, toggleItem, deleteItem, saveItem }: SortableItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const [isEditing, setIsEditing] = useState(false);
    const contentEditableRef = React.useRef<HTMLDivElement>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Initial value for edit mode
    const [htmlContent, setHtmlContent] = useState(item.title);
    const savedSelection = React.useRef<Range | null>(null);

    React.useEffect(() => {
        setHtmlContent(item.title);
    }, [item.title]);

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedSelection.current = sel.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        const sel = window.getSelection();
        if (sel && savedSelection.current) {
            // Ensure focus is back on the editor
            if (contentEditableRef.current) {
                contentEditableRef.current.focus();
            }
            sel.removeAllRanges();
            sel.addRange(savedSelection.current);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        // Setup content when entering edit mode
        setHtmlContent(item.title);
    };

    const handleSave = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (contentEditableRef.current) {
            const newContent = contentEditableRef.current.innerHTML;
            saveItem(item.id, newContent);
            setHtmlContent(newContent);
        }
        setIsEditing(false);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(false);
        setHtmlContent(item.title);
    };

    const applyFormat = (command: string, value?: string) => {
        // Restore selection before applying format
        if (command === 'foreColor') {
            restoreSelection();
        }

        // Use styleWithCSS to generate <span style="color:..."> instead of <font> tags
        document.execCommand('styleWithCSS', false, 'true');

        if (command === 'bold' || command === 'italic') {
            document.execCommand(command, false);
        } else if (command === 'foreColor' && value) {
            document.execCommand('foreColor', false, value);
        }

        // Save selection again if we want to continue editing?
        // Not strictly necessary as execCommand usually keeps selection, but good practice.
    };

    if (isEditing) {
        return (
            <div
                ref={setNodeRef}
                style={{ ...style, marginBottom: '0.5rem', padding: '0.75rem', border: '1px solid #4F46E5', borderRadius: '8px', background: '#fff' }}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                {/* TOOLBAR */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}
                        className="toolbar-btn"
                        title="Bold"
                    >
                        <Bold size={18} />
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }}
                        className="toolbar-btn"
                        title="Italic"
                    >
                        <Italic size={18} />
                    </button>

                    <div style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                if (!showColorPicker) saveSelection(); // Save selection before opening picker
                                setShowColorPicker(!showColorPicker);
                            }}
                            className="toolbar-btn"
                            title="Color"
                        >
                            <Palette size={18} style={{ color: showColorPicker ? '#4F46E5' : 'inherit' }} />
                        </button>
                        {showColorPicker && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0,
                                background: 'white', border: '1px solid #eee',
                                padding: '6px', borderRadius: '6px', display: 'flex', gap: '6px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10
                            }}>
                                {['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#000000'].map(c => (
                                    <div
                                        key={c}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            // Apply color: Restore -> Exec -> Close
                                            applyFormat('foreColor', c);
                                            setShowColorPicker(false);
                                        }}
                                        style={{ width: '24px', height: '24px', backgroundColor: c, borderRadius: '4px', cursor: 'pointer', border: '1px solid #eee' }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <div
                        ref={contentEditableRef}
                        contentEditable
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                        style={{
                            flex: 1,
                            border: '1px solid #e5e7eb',
                            outline: 'none',
                            fontSize: '0.95rem',
                            padding: '8px',
                            borderRadius: '4px',
                            minHeight: '24px'
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSave();
                            }
                        }}
                    />
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <button type="button" onClick={handleSave} className="action-btn save" title="Save">
                            <Check size={16} />
                        </button>
                        <button type="button" onClick={handleCancel} className="action-btn cancel" title="Cancel">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <style>{`
                    .toolbar-btn { background: #f3f4f6; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; color: #4b5563; transition: all 0.2s; }
                    .toolbar-btn:hover { background: #e5e7eb; color: #111; transform: translateY(-1px); }
                    .action-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
                    .action-btn.save { color: #10B981; }
                    .action-btn.save:hover { background: #D1FAE5; }
                    .action-btn.cancel { color: #EF4444; }
                    .action-btn.cancel:hover { background: #FEE2E2; }
                `}</style>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={{ ...style, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', padding: '0.25rem' }}>
            <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#ccc' }}>
                <GripVertical size={14} />
            </div>

            <button onClick={(e) => toggleItem(item.id, item.is_completed, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                {item.is_completed ? <CheckSquare size={18} color="#8c8c8c" /> : <Square size={18} color="#8c8c8c" />}
            </button>
            <div
                onClick={handleEdit}
                style={{
                    flex: 1,
                    fontSize: '0.95rem',
                    opacity: item.is_completed ? 0.6 : 1,
                    textDecoration: item.is_completed ? 'line-through' : 'none',
                    cursor: 'text',
                    minHeight: '24px',
                    display: 'flex', alignItems: 'center',
                    wordBreak: 'break-word'
                }}
                title="Click to edit"
                // Render HTML directly
                dangerouslySetInnerHTML={{ __html: item.title }}
            />
            <button onClick={(e) => deleteItem(item.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3, padding: 0, display: 'flex' }} className="delete-btn">
                <Trash2 size={14} />
            </button>
        </div>
    );
};

interface NoteItemsListProps {
    noteId: string;
}

export const NoteItemsList: React.FC<NoteItemsListProps> = ({ noteId }) => {
    const items = useLiveQuery(
        () => db.items.where({ note: noteId }).filter(i => !i.is_deleted).sortBy('order_index'),
        [noteId]
    );

    const [newItemTitle, setNewItemTitle] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemTitle.trim()) return;

        await db.items.add({
            id: uuidv4(),
            note: noteId,
            title: newItemTitle, // Plain text initially
            is_completed: false,
            order_index: items ? items.length : 0,
            is_deleted: false,
            is_dirty: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        setNewItemTitle('');
        SyncService.pushChanges();
    };

    const toggleItem = async (itemId: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        await db.items.update(itemId, {
            is_completed: !currentStatus,
            is_dirty: true,
            updated_at: new Date().toISOString()
        });
        SyncService.pushChanges();
    };

    const deleteItem = async (itemId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await db.items.update(itemId, { is_deleted: true, is_dirty: true, updated_at: new Date().toISOString() });
        SyncService.pushChanges();
    };

    // NEW: Save Item Handler
    const saveItem = async (itemId: string, newTitle: string) => {
        if (!newTitle.trim()) return;
        await db.items.update(itemId, {
            title: newTitle,
            is_dirty: true,
            updated_at: new Date().toISOString()
        });
        SyncService.pushChanges();
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && items && active.id !== over.id) {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);

            const newOrder = arrayMove(items, oldIndex, newIndex);

            const updates = newOrder.map((item, index) => ({
                ...item,
                order_index: index,
                is_dirty: true,
                updated_at: new Date().toISOString()
            }));

            await db.items.bulkPut(updates);
            SyncService.pushChanges();
        }
    };

    return (
        <div style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items?.map(i => i.id) || []}
                        strategy={verticalListSortingStrategy}
                    >
                        {items?.map(item => (
                            <SortableItem
                                key={item.id}
                                item={item}
                                toggleItem={toggleItem}
                                deleteItem={deleteItem}
                                saveItem={saveItem}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            <form onSubmit={handleAddItem} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginTop: '0.5rem' }}>
                <Plus size={16} color="#8c8c8c" />
                <input
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Add checklist item..."
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{
                        border: 'none',
                        borderBottom: '1px solid transparent',
                        outline: 'none',
                        flex: 1,
                        padding: '0.4rem',
                        background: 'transparent',
                        fontSize: '0.95rem',
                        transition: 'border-color 0.2s'
                    }}
                    className="item-input"
                />
                <style>{`.item-input:focus { border-bottom-color: #e7e5e4 !important; }`}</style>
            </form>
            <style>{`.delete-btn:hover { opacity: 1 !important; color: #d32f2f; }`}</style>
        </div>
    );
};
