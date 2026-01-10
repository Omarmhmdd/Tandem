import React from 'react';
import { Button } from '../ui/Button';
import { Edit, Trash2 } from 'lucide-react';

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'md';
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  variant = 'ghost',
  size = 'sm',
}) => {
  return (
    <div className="flex gap-1">
      <Button variant={variant} size={size} onClick={onEdit} icon={Edit}>
        {editLabel}
      </Button>
      <Button 
        variant={variant} 
        size={size} 
        onClick={onDelete} 
        icon={Trash2}
        className={variant === 'ghost' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : variant === 'outline' ? 'text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50' : ''}
      >
        {deleteLabel}
      </Button>
    </div>
  );
};


