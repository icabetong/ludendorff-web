import React, { lazy, Suspense, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Redirect } from "react-router";
import { withRouter, } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Grow,
  lighten,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { SnackbarProvider } from "notistack";
import { AccountCircleOutlined, ArrowDropDown, ExitToAppRounded, SettingsOutlined } from "@mui/icons-material";
import { ReactComponent as Logo } from "../../shared/brand.svg";

import { signOut } from "firebase/auth";
import { AuthStatus, useAuthState } from "../auth/AuthProvider";
import { Destination, NavigationComponent, TopNavigationComponent } from "../navigation/NavigationComponent";
import { ErrorNotFoundState } from "../state/ErrorStates";
import { ContentLoadingStateComponent, MainLoadingStateComponent } from "../state/LoadingStates";
import { auth } from "../../index";
import IssuedReportScreen from "../issue/IssuedReportScreen";
import StockCardScreen from "../stockcard/StockCardScreen";
import FinishAccountDialog from "../auth/FinishAccountDialog";
import { DialogProvider } from "../../components/DialogProvider";


const AssetScreen = lazy(() => import('../asset/AssetScreen'));
const InventoryReportScreen = lazy(() => import('../inventory/InventoryReportScreen'))
const UserScreen = lazy(() => import('../user/UserScreen'));
const ProfileScreen = lazy(() => import('../profile/ProfileScreen'));
const SettingsScreen = lazy(() => import('../settings/SettingsScreen'));

type InnerComponentPropsType = {
  destination: Destination,
  onDrawerToggle: () => void,
}

const InnerComponent = (props: InnerComponentPropsType) => {
  switch (props.destination) {
    case Destination.ASSETS:
      return <AssetScreen onDrawerToggle={props.onDrawerToggle}/>
    case Destination.INVENTORY:
      return <InventoryReportScreen onDrawerToggle={props.onDrawerToggle}/>
    case Destination.ISSUED:
      return <IssuedReportScreen onDrawerToggle={props.onDrawerToggle}/>
    case Destination.STOCK_CARD:
      return <StockCardScreen onDrawerToggle={props.onDrawerToggle}/>
    case Destination.USERS:
      return <UserScreen onDrawerToggle={props.onDrawerToggle}/>
    case Destination.PROFILE:
      return <ProfileScreen onDrawerToggle={props.onDrawerToggle}/>
    case Destination.SETTINGS:
      return <SettingsScreen onDrawerToggle={props.onDrawerToggle}/>
    default:
      return <ErrorNotFoundState/>
  }
}

type RootContainerComponentPropsType = {
  onNavigate: (destination: Destination) => void,
  currentDestination: Destination,
}

const drawerWidth = 256;
const RootContainerComponent = (props: RootContainerComponentPropsType) => {
  const { user } = useAuthState();
  const { t } = useTranslation();
  const [triggerConfirmSignOut, setTriggerConfirmSignOut] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const onTriggerSignOut = async () => {
    await signOut(auth);
    setTriggerConfirmSignOut(false);
  }

  const onTriggerMenu = () => {
    setMenuOpen((prevOpen) => !prevOpen);
  }

  const onMenuDispose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setMenuOpen(false);
  }

  const onToggleDrawerState = () => {
    setDrawerOpen(!drawerOpen);
  }

  const onNavigateThenDismiss = (destination: Destination) => {
    if (drawerOpen)
      setDrawerOpen(false);

    if (menuOpen)
      setMenuOpen(false);

    props.onNavigate(destination)
    localStorage.setItem('tab', destination.toString())
  }

  const signOutDialog = (
    <Dialog
      open={triggerConfirmSignOut}
      fullWidth={true}
      maxWidth="xs"
      onClose={() => setTriggerConfirmSignOut(false)}>
      <DialogTitle>{t("dialog.sign_out")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("dialog.sign_out_message")}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={() => setTriggerConfirmSignOut(false)}>{t("button.cancel")}</Button>
        <Button
          color="primary"
          onClick={onTriggerSignOut}>{t("button.continue")}</Button>
      </DialogActions>
    </Dialog>
  )

  const container = window !== undefined ? () => window.document.body : undefined;
  const drawerItems = (
    <NavigationComponent
      onNavigate={onNavigateThenDismiss}
      currentDestination={props.currentDestination}/>
  )

  return (
    <Stack sx={{ width: '100%', minHeight: '100vh' }}>
      <Box component="nav" sx={{ height: { lg: 64 }, flexShrink: { lg: 0 }}}>
        <Drawer
          open={drawerOpen}
          container={container}
          variant="temporary"
          onClose={onToggleDrawerState}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { width: '100%', xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}>
          {drawerItems}
        </Drawer>
        <Box sx={{ display: { xs: 'none', lg: 'block' }}}>
          <AppBar color="inherit" elevation={0}>
            <Toolbar>
              <Box
                component={Logo}
                marginRight={3}
                sx={{ maxWidth: '3em', maxHeight: '3em' }}/>
              <Divider
                variant="middle"
                orientation="vertical"
                flexItem
                sx={{ margin: '0.8em 0' }}/>
              <Box
                flexGrow={1}
                marginX={1}>
                <TopNavigationComponent
                  onNavigate={onNavigateThenDismiss}
                  currentDestination={props.currentDestination}/>
              </Box>
              <Divider
                variant="middle"
                orientation="vertical"
                flexItem
                sx={{ margin: '0.8em 0' }}/>
              <Button
                color="inherit"
                sx={{ marginLeft: 2 }}
                ref={anchorRef}
                aria-haspopup="true"
                onClick={onTriggerMenu}
                endIcon={<ArrowDropDown/>}>
                <Box
                  flexDirection="column"
                  textAlign="start">
                  <Typography
                    sx={{
                      textTransform: 'none',
                      color: (theme) => theme.palette.text.primary
                    }}
                    variant="body2">{user && user.firstName}</Typography>
                  <Typography
                    sx={{
                      textTransform: 'none',
                      color: (theme) => theme.palette.text.secondary
                    }}
                    variant="caption">{user && user.email}</Typography>
                </Box>
              </Button>
              <Popper
                open={menuOpen}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal>
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'
                    }}>
                    <Paper sx={{ backgroundColor: theme => lighten(theme.palette.background.paper, 0.2)}}>
                      <ClickAwayListener onClickAway={onMenuDispose}>
                        <MenuList id="navigation-menu">
                          <MenuItem
                            key="profile"
                            onClick={() => onNavigateThenDismiss(Destination.PROFILE)}>
                            <ListItemIcon><AccountCircleOutlined/></ListItemIcon>
                            <ListItemText>{t("navigation.profile")}</ListItemText>
                          </MenuItem>
                          <MenuItem
                            key="settings"
                            onClick={() => onNavigateThenDismiss(Destination.SETTINGS)}>
                            <ListItemIcon><SettingsOutlined/></ListItemIcon>
                            <ListItemText>{t('navigation.settings')}</ListItemText>
                          </MenuItem>
                          <MenuItem
                            key="signOut"
                            onClick={() => setTriggerConfirmSignOut(true)}>
                            <ListItemIcon><ExitToAppRounded/></ListItemIcon>
                            <ListItemText>{t('button.sign_out')}</ListItemText>
                          </MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Toolbar>
          </AppBar>
        </Box>
      </Box>
      <Divider/>
      <Box sx={{
        width: '100%',
        display: 'flex',
        maxWidth: { xl: '1600px' },
        margin: '0 auto',
        flexGrow: 1,
        overflowY: 'hidden',
      }}>
        <Suspense fallback={<ContentLoadingStateComponent/>}>
          <InnerComponent
            destination={props.currentDestination}
            onDrawerToggle={onToggleDrawerState}/>
        </Suspense>
      </Box>
      {signOutDialog}
    </Stack>
  );
}

const RootComponent = () => {
  const { status, user } = useAuthState();
  const theme = useTheme();
  const isXSDeviceWidth = useMediaQuery(theme.breakpoints.down('sm'));
  const [destination, setDestination] = useState<Destination>(() => {
    const previousDestination = localStorage.getItem('tab');
    return previousDestination ? parseInt(previousDestination) : Destination.ASSETS;
  });

  const onNavigate = (newDestination: Destination) => {
    setDestination(newDestination)
  }

  if (status === AuthStatus.PENDING) {
    return <MainLoadingStateComponent/>
  } else if (status === AuthStatus.FETCHED) {
    if (user !== undefined) {
      return (
        <DialogProvider>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: isXSDeviceWidth ? 'center' : 'right'
            }}>
            <>
              <RootContainerComponent
                onNavigate={onNavigate}
                currentDestination={destination}/>
              <FinishAccountDialog isOpen={!user.setupCompleted}/>
            </>
          </SnackbarProvider>
        </DialogProvider>
      )
    } else return <Redirect to="/auth"/>
  } else return <Redirect to="/error"/>
}
export default withRouter(RootComponent);