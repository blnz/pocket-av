import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

interface RegistrationProps {
  onSave: (data: { username: string; passphrase: string }) => void;
}

export default function Registration({ onSave }: RegistrationProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [passphrase2, setPassphrase2] = useState("");
  const [mismatch, setMismatch] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setMismatch(false);
    setUsername("");
    setPassphrase("");
    setPassphrase2("");
  };

  const handleSubmit = () => {
    if (passphrase === passphrase2) {
      setOpen(false);
      onSave({ username, passphrase });
    } else {
      setMismatch(true);
    }
  };

  return (
    <div>
      <Button
        variant="text"
        color="primary"
        onClick={handleOpen}
        data-testid="btn-register-open"
      >
        Register
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>New Registration</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            placeholder="jane@example.com"
            fullWidth
            margin="dense"
            onChange={(e) => setUsername(e.target.value)}
            id="username"
            data-testid="input-reg-username"
          />
          <TextField
            label="Pass Phrase"
            placeholder="Pass Phrase"
            fullWidth
            margin="dense"
            sx={{ width: "90%" }}
            onChange={(e) => setPassphrase(e.target.value)}
            id="passphrase"
            data-testid="input-reg-passphrase"
          />
          <TextField
            label="Confirm Pass Phrase"
            placeholder="Pass Phrase"
            fullWidth
            margin="dense"
            sx={{ width: "90%" }}
            error={mismatch}
            helperText={mismatch ? "pass phrases don't match" : undefined}
            onChange={(e) => setPassphrase2(e.target.value)}
            id="passphrase2"
            data-testid="input-reg-passphrase2"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            data-testid="btn-register-submit"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
