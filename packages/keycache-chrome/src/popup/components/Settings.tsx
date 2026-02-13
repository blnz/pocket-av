import { useState } from "react";
import {
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Typography,
  Box,
} from "@mui/material";
import DownloadLink from "./DownloadLink";
import { useStore } from "../../store";

export default function Settings() {
  const { settings, cards, toggleSyncServer, setSyncServerHost } =
    useStore();
  const [hostInput, setHostInput] = useState(settings.syncServerHost);

  const handleHostKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setSyncServerHost(hostInput);
    }
  };

  return (
    <Box sx={{ m: "10px", maxWidth: 300 }}>
      <Typography variant="h5">Settings</Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Synchronization</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.useSyncServer}
              onChange={toggleSyncServer}
              data-testid="switch-sync"
            />
          }
          label="Allow syncing with cloud"
        />
        <TextField
          id="syncServer"
          label="Server Host"
          value={hostInput}
          onChange={(e) => setHostInput(e.target.value)}
          onKeyDown={handleHostKeyDown}
          onBlur={() => setSyncServerHost(hostInput)}
          fullWidth
          margin="dense"
          data-testid="input-sync-host"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="h6">Backups and Exports</Typography>
        <DownloadLink
          label="export cards"
          filename="cards.json"
          exportFile={() =>
            JSON.stringify(
              cards
                .filter((c) => c.clear)
                .map((c) => ({
                  id: c.id,
                  version: c.version,
                  clear: c.clear,
                })),
              null,
              4,
            )
          }
        />
        <DownloadLink
          label="make backup"
          filename="backup.json"
          exportFile={async () => {
            if (
              typeof chrome !== "undefined" &&
              chrome.storage?.local
            ) {
              const data =
                await chrome.storage.local.get("keycache-store");
              return data["keycache-store"] ?? "{}";
            }
            return localStorage.getItem("keycache-store") ?? "{}";
          }}
        />
      </Box>
    </Box>
  );
}
