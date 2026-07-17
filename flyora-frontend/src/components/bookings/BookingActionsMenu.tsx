import React, { useEffect, useRef, useState } from 'react';
import { Copy, MoreVertical, PencilLine, Trash2, XCircle, Eye } from 'lucide-react';

interface Props {
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

const BookingActionsMenu: React.FC<Props> = ({ onViewDetails, onEdit, onDuplicate, onCancel, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const runAction = (action?: () => void) => {
    action?.();
    setOpen(false);
  };

  return (
    <div className="booking-menu" ref={menuRef}>
      <button type="button" className="booking-menu__trigger" onClick={() => setOpen((value) => !value)} aria-label="More booking actions">
        <MoreVertical size={16} strokeWidth={2} />
      </button>
      {open && (
        <div className="booking-menu__dropdown" role="menu">
          <button type="button" onClick={() => runAction(onViewDetails)}><Eye size={14} strokeWidth={2} /> View Details</button>
          <button type="button" onClick={() => runAction(onEdit)}><PencilLine size={14} strokeWidth={2} /> Edit</button>
          <button type="button" onClick={() => runAction(onDuplicate)}><Copy size={14} strokeWidth={2} /> Duplicate</button>
          <button type="button" onClick={() => runAction(onCancel)}><XCircle size={14} strokeWidth={2} /> Cancel</button>
          <button type="button" onClick={() => runAction(onDelete)}><Trash2 size={14} strokeWidth={2} /> Delete</button>
        </div>
      )}
    </div>
  );
};

export default BookingActionsMenu;