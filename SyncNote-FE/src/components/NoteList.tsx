import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams } from 'react-router-dom';
import { db } from '../db/db';
import { Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { NoteItemsList } from './NoteItemsList';
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



interface SortableNoteProps {
    note: any;
    isExpanded: boolean;
    toggleExpand: (id: string) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

const SortableNote = ({ note, isExpanded, toggleExpand, onDelete }: SortableNoteProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: note.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };



    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`card note-card ${isExpanded ? 'active' : ''}`}
            onClick={() => toggleExpand(note.id)}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isExpanded ? <ChevronDown size={20} color="#888" /> : <ChevronRight size={20} color="#888" />}
                    <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>{note.title}</span>
                </div>
                <button
                    onClick={(e) => onDelete(note.id, e)}
                    className="icon-btn-danger"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {isExpanded && (
                <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '1rem', paddingTop: '1rem', cursor: 'default' }} onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
                    <NoteItemsList noteId={note.id} />
                </div>
            )}
        </div>
    );
};

export const NoteList = () => {
    const { categoryId } = useParams();
    // CHANGED: sortBy 'order_index' instead of 'updated_at'
    const notes = useLiveQuery(
        () => db.notes.where({ category: categoryId }).filter(n => !n.is_deleted).sortBy('order_index'),
        [categoryId]
    );

    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !categoryId) return;

        const newId = uuidv4();

        // Guarantee top placement by using current timestamp negation
        // This ensures the value is always smaller than any existing valid order_index
        const order_index = -Date.now();

        await db.notes.add({
            id: newId,
            category: categoryId,
            title: title,
            order_index,
            is_deleted: false,
            is_dirty: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        setTitle('');
        setIsCreating(false);
        setExpandedNoteId(newId); // Auto expand new note
        SyncService.pushChanges(); // Auto-push
    };

    const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete this note?')) {
            await db.notes.update(id, { is_deleted: true, is_dirty: true, updated_at: new Date().toISOString() });
            SyncService.pushChanges(); // Auto-push
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedNoteId(expandedNoteId === id ? null : id);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && notes && active.id !== over.id) {
            const oldIndex = notes.findIndex((n) => n.id === active.id);
            const newIndex = notes.findIndex((n) => n.id === over.id);

            const newOrder = arrayMove(notes, oldIndex, newIndex);

            const updates = newOrder.map((note, index) => ({
                ...note,
                order_index: index,
                is_dirty: true,
                updated_at: new Date().toISOString()
            }));

            await db.notes.bulkPut(updates);
            SyncService.pushChanges();
        }
    };

    const category = useLiveQuery(
        async () => {
            if (!categoryId) return undefined;
            return await db.categories.get(categoryId);
        },
        [categoryId]
    );

    return (
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-color)', margin: 0 }}>
                    {category?.name || 'Notes'}
                </h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem'
                    }}
                >
                    <Plus size={18} /> New Note
                </button>
            </div>

            {isCreating && (
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                    <form onSubmit={handleCreate}>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e5e5e5',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                            onBlur={() => !title && setIsCreating(false)}
                        />
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={notes?.map(n => n.id) || []}
                        strategy={verticalListSortingStrategy}
                    >
                        {notes?.map(note => (
                            <SortableNote
                                key={note.id}
                                note={note}
                                isExpanded={expandedNoteId === note.id}
                                toggleExpand={toggleExpand}
                                onDelete={handleDeleteNote}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {notes?.length === 0 && !isCreating && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                        <p>No notes yet. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
