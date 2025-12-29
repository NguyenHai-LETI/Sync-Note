import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const CategoryList = () => {
    const categories = useLiveQuery(() => db.categories.orderBy('order_index').toArray());
    const navigate = useNavigate();
    const [newCatName, setNewCatName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

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
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete category?')) {
            await db.categories.update(id, { is_deleted: true, is_dirty: true, updated_at: new Date().toISOString() });
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>CATEGORIES</span>
                <button onClick={() => setIsCreating(true)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <Plus size={16} />
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
                    <input
                        autoFocus
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Category Name"
                        style={{ width: '100%', padding: '0.25rem' }}
                        onBlur={() => !newCatName && setIsCreating(false)}
                    />
                </form>
            )}

            {categories?.filter(c => !c.is_deleted).map(cat => (
                <div
                    key={cat.id}
                    onClick={() => navigate(`/categories/${cat.id}`)}
                    style={{
                        padding: '0.5rem',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        justifyContent: 'space-between'
                    }}
                    className="hover-bg"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Folder size={16} color="#666" />
                        <span>{cat.name}</span>
                    </div>
                    <button onClick={(e) => handleDelete(cat.id, e)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0.5 }}>
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
            <style>{`.hover-bg:hover { background-color: #eee; }`}</style>
        </div>
    );
};
