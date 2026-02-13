import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";

interface AppHeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  onWipe: () => void;
}

export default function AppHeader({
  isLoggedIn,
  onLogout,
  onWipe,
}: AppHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isSubpage = location.pathname !== "/";

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {isSubpage ? (
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => navigate(-1)}
            data-testid="btn-back"
          >
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <IconButton edge="start" disabled>
            <span />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          KeyCache
        </Typography>

        <IconButton
          color="inherit"
          onClick={handleMenuOpen}
          data-testid="btn-menu"
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ horizontal: "right", vertical: "top" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
        >
          {isLoggedIn && (
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onLogout();
              }}
              data-testid="menu-logout"
            >
              Logout
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/settings");
            }}
            data-testid="menu-preferences"
          >
            Preferences
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onWipe();
            }}
            data-testid="menu-erase"
          >
            Erase All Data
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
