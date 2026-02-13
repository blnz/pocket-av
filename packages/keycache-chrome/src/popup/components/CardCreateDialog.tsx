import { useState } from "react";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CardView from "./CardView";
import type { Card, CardClear } from "../../store/types";

interface CardCreateDialogProps {
  onSave: (clear: CardClear) => void;
}

const fabStyle = {
  position: "fixed" as const,
  bottom: 20,
  right: 20,
};

export default function CardCreateDialog({
  onSave,
}: CardCreateDialogProps) {
  const [open, setOpen] = useState(false);

  const emptyCard: Card = {
    id: "",
    version: "",
    clear: {
      name: "",
      url: "",
      username: "",
      password: "",
      note: "",
      type: "web",
    },
  };

  const handleSave = (card: Card) => {
    setOpen(false);
    if (card.clear) {
      onSave(card.clear);
    }
  };

  return (
    <div>
      <Fab
        color="primary"
        style={fabStyle}
        onClick={() => setOpen(true)}
        data-testid="btn-card-create"
      >
        <AddIcon />
      </Fab>
      {open && (
        <CardView
          card={emptyCard}
          viewMode="create"
          onSave={handleSave}
          onCancel={() => setOpen(false)}
        />
      )}
    </div>
  );
}
