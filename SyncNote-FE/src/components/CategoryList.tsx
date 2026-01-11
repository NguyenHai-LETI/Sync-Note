import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';
import { Plus, BookText, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
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

interface SortableCategoryProps {
    category: any;
    onDelete: (id: string, e: React.MouseEvent) => void;
    onClick: () => void;
}

const SortableCategory = ({ category, onDelete, onClick }: SortableCategoryProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: category.id });

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
            onClick={onClick}
            className="hover-bg"
        >
            <div style={{
                padding: '0.5rem',
                cursor: 'grab',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookText size={18} color="#4F46E5" />
                    <span>{category.name}</span>
                </div>
                <button
                    onClick={(e) => onDelete(category.id, e)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0.5 }}
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on delete button
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

export const CategoryList = () => {
    const categories = useLiveQuery(() => db.categories.orderBy('order_index').toArray());
    const navigate = useNavigate();
    const [newCatName, setNewCatName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

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
        if (!newCatName.trim()) return;

        const newId = uuidv4();
        await db.categories.add({
            id: newId,
            name: newCatName,
            order_index: categories ? categories.length : 0,
            is_deleted: false,
            is_dirty: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        setNewCatName('');
        setIsCreating(false);
        SyncService.pushChanges();
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete category?')) {
            await db.categories.update(id, { is_deleted: true, is_dirty: true, updated_at: new Date().toISOString() });
            SyncService.pushChanges();
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && categories && active.id !== over.id) {
            const oldIndex = categories.findIndex((c) => c.id === active.id);
            const newIndex = categories.findIndex((c) => c.id === over.id);

            const newOrder = arrayMove(categories, oldIndex, newIndex);

            // Optimistic update and DB save
            const updates = newOrder.map((cat, index) => ({
                ...cat,
                order_index: index,
                is_dirty: true,
                updated_at: new Date().toISOString()
            }));

            await db.categories.bulkPut(updates);
            SyncService.pushChanges();
        }
    };

    const activeCategories = categories?.filter(c => !c.is_deleted) || [];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>CATEGORIES</span>
                <button onClick={() => setIsCreating(true)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <Plus size={16} />
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
                    <input
                        autoFocus
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="New Category Name"
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            borderRadius: '8px',
                            border: '1px solid #e7e5e4',
                            outline: 'none',
                            fontSize: '0.9rem',
                            backgroundColor: '#fff',
                            boxSizing: 'border-box'
                        }}
                        onBlur={() => !newCatName && setIsCreating(false)}
                    />
                </form>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={activeCategories.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {activeCategories.map(cat => (
                            <SortableCategory
                                key={cat.id}
                                category={cat}
                                onDelete={handleDelete}
                                onClick={() => navigate(`/categories/${cat.id}`)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <style>{`.hover-bg:hover { background-color: #eee; }`}</style>
        </div>
    );
};
