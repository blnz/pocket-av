import { useState } from "react";
import CardView from "./CardView";
import type { Card } from "../../store/types";

type ViewMode = "view" | "edit";

interface CardViewDialogProps {
  card: Card;
  onSave: (card: Card) => void;
  onDelete: (card: Card) => void;
  onClose: () => void;
}

export default function CardViewDialog({
  card,
  onSave,
  onDelete,
  onClose,
}: CardViewDialogProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("view");

  const handleEdit = () => {
    setViewMode("edit");
  };

  const handleSave = (updated: Card) => {
    onSave(updated);
  };

  const handleDelete = (c: Card) => {
    onDelete(c);
  };

  return (
    <CardView
      card={card}
      viewMode={viewMode}
      onSave={handleSave}
      onCancel={onClose}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
