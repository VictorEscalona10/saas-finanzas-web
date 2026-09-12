'use client';

import Modal from '@/src/components/shared/Modal';
import type { ImportMode } from '@/src/domain/spreadsheet/types';
import './ImportOptionsModal.css';

interface ImportOptionsModalProps {
  open: boolean;
  title: string;
  rowCount: number;
  onCancel: () => void;
  onConfirm: (mode: ImportMode) => void;
}

interface ImportOption {
  mode: ImportMode;
  icon: string;
  title: string;
  description: string;
  danger?: boolean;
}

const OPTIONS: ImportOption[] = [
  {
    mode: 'append-right',
    icon: 'chevron_right',
    title: 'Añadir a la derecha',
    description: 'Conserva los datos actuales y agrega los campos nuevos al final.',
  },
  {
    mode: 'append-left',
    icon: 'chevron_left',
    title: 'Añadir a la izquierda',
    description: 'Conserva los datos actuales y agrega los campos nuevos al inicio.',
  },
  {
    mode: 'replace',
    icon: 'delete_forever',
    title: 'Reemplazar tabla',
    description: 'Limpia toda la tabla e importa solo los datos y campos nuevos.',
    danger: true,
  },
];

export default function ImportOptionsModal({
  open,
  title,
  rowCount,
  onCancel,
  onConfirm,
}: ImportOptionsModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="import-options__intro">
        Se importarán <strong>{rowCount}</strong> {rowCount === 1 ? 'fila' : 'filas'}. Elige cómo
        quieres que se combinen con los datos actuales:
      </p>
      <div className="import-options__list">
        {OPTIONS.map((option) => (
          <button
            key={option.mode}
            type="button"
            className={`import-options__option${
              option.danger ? ' import-options__option--danger' : ''
            }`}
            onClick={() => onConfirm(option.mode)}
          >
            <span className="material-symbols-outlined import-options__option-icon">
              {option.icon}
            </span>
            <span className="import-options__option-text">
              <span className="import-options__option-title">{option.title}</span>
              <span className="import-options__option-description">{option.description}</span>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
