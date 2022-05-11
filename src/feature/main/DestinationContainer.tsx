import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Drawer,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ExitToAppRounded, AccountCircleRounded } from "@mui/icons-material";
import { signOut } from "firebase/auth";
import { auth } from "../../index";
import { Destination, NavigationContainer } from "../navigation/NavigationContainer";
import ContentSwitcher from "./ContentSwitcher";
import { useDialog } from "../../components/DialogProvider";

type DestinationContainerProps = {
  destination: Destination,
  onNavigate: (destination: Destination) => void
}
const drawerWidth = 256;
const DestinationContainer = (props: DestinationContainerProps) => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorElement);
  const show = useDialog();

  const onSignOut = async () => {
    setAnchorElement(null);
    let result = await show({
      title: t("dialog.sign_out"),
      description: t("dialog.sign_out_summary"),
      confirmButtonText: t("button.sign_out"),
      dismissButtonText: t("button.cancel")
    });

    if (result) await signOut(auth);
  }

  const onToggleDrawerState = () => setDrawerOpen(prevState => !prevState);

  const onMenuDismiss = () => setAnchorElement(null);
  const onNavigateThenDismiss = (destination: Destination) => {
    if (drawerOpen)
      setDrawerOpen(false);
    if (menuOpen)
      setAnchorElement(null);

    props.onNavigate(destination)
    localStorage.setItem('tab', destination.toString())
  }

  const container = window !== undefined ? () => window.document.body : undefined;
  const drawerItems = (
    <NavigationContainer
      destination={props.destination}
      onNavigate={onNavigateThenDismiss}
      onSignOut={setAnchorElement}/>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
        aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={drawerOpen}
          onClose={onToggleDrawerState}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}>
          {drawerItems}
        </Drawer>
        <Drawer
          open
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}>
          {drawerItems}
        </Drawer>
        <Menu
          open={menuOpen}
          anchorEl={anchorElement}
          onClose={onMenuDismiss}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}>
          <MenuItem
            onClick={() => onNavigateThenDismiss(Destination.PROFILE)}>
            <ListItemIcon>
              <AccountCircleRounded/>
            </ListItemIcon>
            <ListItemText>{t("button.account_settings")}</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={onSignOut}>
            <ListItemIcon>
              <ExitToAppRounded/>
            </ListItemIcon>
            <ListItemText>{t("button.sign_out")}</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
      <Box
        component="main"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1
        }}>
        <ContentSwitcher
          destination={props.destination}
          onDrawerToggle={onToggleDrawerState}/>
      </Box>
    </Box>
  )
}

export default DestinationContainer;