import { ThemeProvider, CssBaseline, Typography, Box } from "@mui/material";
import { HashRouter, Routes, Route } from "react-router-dom";
import { theme } from "./theme";
import { useStore } from "../store";
import { useAuth } from "./hooks/useAuth";
import { useCards } from "./hooks/useCards";
import AppHeader from "./components/AppHeader";
import Authentication from "./components/Authentication";
import Registration from "./components/Registration";
import CardsList from "./components/CardsList";
import Settings from "./components/Settings";

function AppContent() {
  const { user, cards, masterKey, hydrated, wipeAll } = useStore();
  const { register, login, logout } = useAuth();
  const { addCard, updateCard, removeCard } = useCards();

  const isLoggedIn = masterKey !== null;
  const isRegistered = Boolean(user.wrappedKey);

  if (!hydrated) {
    return null;
  }

  const body = () => {
    if (isLoggedIn) {
      return (
        <CardsList
          cards={cards}
          onAddCard={addCard}
          onUpdateCard={updateCard}
          onDeleteCard={removeCard}
        />
      );
    }

    if (isRegistered) {
      return (
        <Box sx={{ m: "40px" }}>
          <Typography>Please authenticate</Typography>
          <Authentication
            onSave={login}
            username={user.username ?? ""}
          />
        </Box>
      );
    }

    return (
      <Box>
        <Box sx={{ fontSize: "100%", m: "20px" }}>
          <Typography variant="h5" gutterBottom>
            Welcome to <em>KeyCache</em>, the secure, open source
            password manager.
          </Typography>
          <Typography paragraph>
            On the next screen you'll be asked to come up with a
            username and a pass phrase.
          </Typography>
          <Typography paragraph>
            The pass phrase will be used to secure all the data that
            KeyCache manages for you. KeyCache doesn't store the pass
            phrase, so if you lose or forget it, KeyCache won't be able
            to recover it. You'll want to invent a pass phrase that is
            possible for you to remember but impossible for others to
            guess.
          </Typography>
          <Typography paragraph>
            To get started, click the "REGISTER" button, below.
          </Typography>
        </Box>
        <Registration onSave={register} />
      </Box>
    );
  };

  return (
    <>
      <AppHeader
        isLoggedIn={isLoggedIn}
        onLogout={logout}
        onWipe={wipeAll}
      />
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={body()} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ThemeProvider>
  );
}
