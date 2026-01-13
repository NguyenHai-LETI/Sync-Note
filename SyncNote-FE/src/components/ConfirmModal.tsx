import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'danger'
}) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={onCancel}>
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    width: '90%',
                    maxWidth: '400px',
                    padding: '1.5rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    position: 'relative',
                    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        border: 'none',
                        background: 'transparent',
                        padding: '4px',
                        cursor: 'pointer',
                        color: '#a8a29e'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: type === 'danger' ? '#FEF2F2' : '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: type === 'danger' ? '#EF4444' : '#3B82F6'
                    }}>
                        <AlertTriangle size={24} />
                    </div>

                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#1c1917' }}>
                            {title}
                        </h3>
                        <p style={{ margin: 0, color: '#78716c', fontSize: '0.95rem', lineHeight: 1.5 }}>
                            {message}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
                        <button
                            onClick={onCancel}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '10px',
                                border: '1px solid #e7e5e4',
                                background: 'white',
                                color: '#44403c',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            className="modal-btn-secondary"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onCancel();
                            }}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '10px',
                                border: 'none',
                                background: type === 'danger' ? '#EF4444' : '#292524',
                                color: 'white',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            className="modal-btn-primary"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .modal-btn-secondary:hover {
                        background-color: #f5f5f4;
                        border-color: #d6d3d1;
                    }
                    .modal-btn-primary:hover {
                        opacity: 0.9;
                        transform: translateY(-1px);
                    }
                `}</style>
            </div>
        </div>
    );
};
