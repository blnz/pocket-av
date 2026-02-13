import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";
import type { Card, CardClear } from "../../store/types";

type ViewMode = "view" | "edit" | "create";

interface CardViewProps {
  card: Card;
  viewMode: ViewMode;
  onSave: (card: Card) => void;
  onCancel: () => void;
  onEdit?: (card: Card) => void;
  onDelete?: (card: Card) => void;
}

export default function CardView({
  card,
  viewMode,
  onSave,
  onCancel,
  onEdit,
  onDelete,
}: CardViewProps) {
  const [clear, setClear] = useState<Partial<CardClear>>(
    card.clear ?? {},
  );
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setClear(card.clear ?? {});
  }, [card]);

  const disabled = viewMode === "view";

  const updateField = (field: keyof CardClear, value: string) => {
    setClear((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave({ ...card, clear: clear as CardClear });
  };

  const CopyButton = ({ value }: { value?: string }) => (
    <CopyToClipboard text={value ?? ""}>
      <Tooltip title="copy">
        <IconButton size="small" tabIndex={-1}>
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </CopyToClipboard>
  );

  const title =
    viewMode === "create" ? (
      "New Card"
    ) : (
      <div style={{ textAlign: "right" }}>
        {onEdit && (
          <Tooltip title="edit">
            <IconButton
              onClick={() => onEdit(card)}
              data-testid="btn-card-edit"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="delete">
            <IconButton
              onClick={() => onDelete(card)}
              data-testid="btn-card-delete"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="close">
          <IconButton
            onClick={onCancel}
            data-testid="btn-card-close"
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </div>
    );

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          placeholder="Card name"
          disabled={disabled}
          defaultValue={clear.name}
          onChange={(e) => updateField("name", e.target.value)}
          fullWidth
          margin="dense"
          id="name"
          data-testid="input-card-name"
        />
        <TextField
          label="URL"
          placeholder="www.example.com"
          disabled={disabled}
          defaultValue={clear.url}
          onChange={(e) => updateField("url", e.target.value)}
          fullWidth
          margin="dense"
          id="url"
          data-testid="input-card-url"
        />
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <CopyButton value={clear.username} />
          <TextField
            label="Username"
            placeholder="jane@example.com"
            disabled={disabled}
            defaultValue={clear.username}
            onChange={(e) => updateField("username", e.target.value)}
            fullWidth
            margin="dense"
            id="username"
            data-testid="input-card-username"
          />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <CopyButton value={clear.password} />
          <TextField
            label="Password"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            disabled={disabled}
            defaultValue={clear.password}
            onChange={(e) => updateField("password", e.target.value)}
            fullWidth
            margin="dense"
            id="password"
            data-testid="input-card-password"
          />
          <Tooltip title={showPassword ? "hide" : "show"}>
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <VisibilityOffIcon />
              ) : (
                <VisibilityIcon />
              )}
            </IconButton>
          </Tooltip>
        </div>
        <TextField
          label="Notes"
          placeholder="Notes"
          multiline
          rows={2}
          maxRows={4}
          disabled={disabled}
          defaultValue={clear.note}
          onChange={(e) => updateField("note", e.target.value)}
          fullWidth
          margin="dense"
          id="note"
          data-testid="input-card-note"
        />
      </DialogContent>
      {viewMode !== "view" && (
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            data-testid="btn-card-save"
          >
            Save
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
