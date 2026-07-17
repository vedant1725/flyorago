import React, { useEffect, useRef, useState } from 'react';
import { Copy, Download, Eye, MoreVertical, PencilLine, Trash2, XCircle } from 'lucide-react';

interface Props {
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onDownloadLabel?: () => void;
}

const ShipmentActionMenu: React.FC<Props> = ({ onViewDetails, onEdit, onDuplicate, onCancel, onDelete, onDownloadLabel }) => {
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
    <div className="shipment-menu" ref={menuRef}>
      <button type="button" className="shipment-menu__trigger" onClick={() => setOpen((value) => !value)} aria-label="More shipment actions">
        <MoreVertical size={16} strokeWidth={2} />
      </button>
      {open && (
        <div className="shipment-menu__dropdown" role="menu">
          <button type="button" onClick={() => runAction(onViewDetails)}><Eye size={14} strokeWidth={2} /> View Details</button>
          <button type="button" onClick={() => runAction(onEdit)}><PencilLine size={14} strokeWidth={2} /> Edit Shipment</button>
          <button type="button" onClick={() => runAction(onDownloadLabel)}><Download size={14} strokeWidth={2} /> Download Label</button>
          <button type="button" onClick={() => runAction(onDuplicate)}><Copy size={14} strokeWidth={2} /> Duplicate Shipment</button>
          <button type="button" onClick={() => runAction(onCancel)}><XCircle size={14} strokeWidth={2} /> Cancel Shipment</button>
          <button type="button" onClick={() => runAction(onDelete)}><Trash2 size={14} strokeWidth={2} /> Delete Shipment</button>
        </div>
      )}
    </div>
  );
};

export default ShipmentActionMenu;
