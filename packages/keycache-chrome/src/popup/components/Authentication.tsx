import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

interface AuthenticationProps {
  onSave: (data: { passphrase: string }) => void;
  username: string;
}

export default function Authentication({
  onSave,
  username,
}: AuthenticationProps) {
  const [open, setOpen] = useState(true);
  const [passphrase, setPassphrase] = useState("");

  const handleSubmit = () => {
    setOpen(false);
    onSave({ passphrase });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div>
      <Button
        variant="text"
        color="primary"
        onClick={() => setOpen(true)}
      >
        Authenticate
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Authentication</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            placeholder="jane@example.com"
            value={username}
            disabled
            fullWidth
            margin="dense"
            id="username"
            data-testid="input-username"
          />
          <TextField
            label="Pass Phrase"
            placeholder="Pass Phrase"
            type="password"
            fullWidth
            margin="dense"
            autoFocus
            onChange={(e) => setPassphrase(e.target.value)}
            onKeyDown={handleKeyDown}
            id="passphrase"
            data-testid="input-passphrase"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            data-testid="btn-login"
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
