import React, { ComponentClass, FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Theme,
  Typography,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import {
  AccountCircleOutlined,
  DesktopWindowsRounded,
  ExitToAppRounded,
  Inventory2Outlined,
  LocalAtmOutlined,
  PeopleOutlineRounded,
  SettingsOutlined,
  UploadFileOutlined
} from "@mui/icons-material";
import { signOut } from "firebase/auth";
import { AuthStatus, useAuthState, usePermissions } from "../auth/AuthProvider";
import { auth } from "../../index";

export enum Destination {
  ASSETS = 1,
  INVENTORY,
  ISSUED,
  STOCK_CARD,
  USERS,
  PROFILE,
  SETTINGS
}

type NavigationItemType = {
  icon: string | FunctionComponent<any> | ComponentClass<any, any>,
  title: string,
  destination?: Destination
}

type NavigationComponentPropsType = {
  onNavigate: (destination: Destination) => void,
  currentDestination: Destination,
}

type NavigationListPropsType = {
  items: NavigationItemType[],
  destination: Destination,
  onNavigate: (destination: Destination) => void
}

type NavigationItemPropsType = {
  itemKey: any,
  navigation: NavigationItemType,
  action: () => void,
  isActive: boolean
}

const useStyles = makeStyles((theme: Theme) => ({
  inset: {
    marginBottom: '1em'
  },
  container: {
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: '12px',
      paddingRight: '12px',
    },
    '& .MuiListItemIcon-root': {
      width: '1.6em',
      height: '1.6em',
      color: theme.palette.text.primary
    },
    '&$selected': {
      backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.primary.main, 0.2),
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.main
      },
      '& .MuiListItemText-root': {
        '& .MuiTypography-root': {
          color: theme.palette.primary.main
        },
      },
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    }
  },
  navigation: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  navigationText: {
    color: theme.palette.text.primary
  },
  selected: {},
}));

const destinations: NavigationItemType[] = [
  { icon: DesktopWindowsRounded, title: "navigation.assets", destination: Destination.ASSETS },
  { icon: Inventory2Outlined, title: "navigation.inventories", destination: Destination.INVENTORY },
  { icon: UploadFileOutlined, title: "navigation.issued", destination: Destination.ISSUED },
  { icon: LocalAtmOutlined, title: "navigation.stock_cards", destination: Destination.STOCK_CARD },
  { icon: PeopleOutlineRounded, title: "navigation.users", destination: Destination.USERS },
]

export const NavigationComponent = (props: NavigationComponentPropsType) => {
  const classes = useStyles();
  const { status, user } = useAuthState();
  const [triggerConfirmSignOut, setTriggerConfirmSignOut] = useState(false);
  const { t } = useTranslation();

  const minorDestinations: NavigationItemType[] = [
    {
      icon: AccountCircleOutlined,
      title: status === AuthStatus.FETCHED && user?.firstName !== undefined
        ? user!.firstName
        : t("profile"),
      destination: Destination.PROFILE
    },
    { icon: SettingsOutlined, title: "navigation.settings", destination: Destination.SETTINGS },
  ]

  const confirmSignOut = () => {
    setTriggerConfirmSignOut(true);
  }

  const triggerSignOut = async () => {
    await signOut(auth);
    setTriggerConfirmSignOut(false);
  }

  return (
    <Box>
      <Box className="inset"/>
      <ListSubheader>{ t("navigation.manage") }</ListSubheader>
      <List className={ classes.navigation }>
        <NavigationList
          items={ destinations }
          destination={ props.currentDestination }
          onNavigate={ props.onNavigate }/>
      </List>
      <Divider/>
      <ListSubheader>{ t("navigation.account") }</ListSubheader>
      <List className={ classes.navigation }>
        <NavigationList
          items={ minorDestinations }
          destination={ props.currentDestination }
          onNavigate={ props.onNavigate }/>
        <NavigationListItem
          itemKey={ 1 }
          navigation={ { icon: ExitToAppRounded, title: t("button.sign_out") } }
          isActive={ false }
          action={ () => confirmSignOut() }/>
      </List>
      <Dialog
        open={ triggerConfirmSignOut }
        fullWidth={ true }
        maxWidth="xs"
        onClose={ () => setTriggerConfirmSignOut(false) }>
        <DialogTitle>{ t("dialog.sign_out") }</DialogTitle>
        <DialogContent>
          <DialogContentText>{ t("dialog.sign_out_message") }</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={ () => setTriggerConfirmSignOut(false) }>{ t("button.cancel") }</Button>
          <Button
            color="primary"
            onClick={ triggerSignOut }>{ t("button.continue") }</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}


const NavigationListItem = (props: NavigationItemPropsType) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <ListItem
      button
      classes={ { root: classes.container, selected: classes.selected } }
      key={ props.itemKey }
      selected={ props.isActive }
      onClick={ props.action }>
      <ListItemIcon>{
        React.createElement(props.navigation.icon)
      }
      </ListItemIcon>
      <ListItemText primary={ <Typography variant="body2">{ t(props.navigation.title) }</Typography> }/>
    </ListItem>
  )
}

const NavigationList = (props: NavigationListPropsType) => {
  const { canRead, canManageUsers } = usePermissions();

  return (
    <React.Fragment>{
      props.items.map((navigation: NavigationItemType) => {
        if (!canRead && navigation.destination === Destination.ASSETS)
          return <></>;
        if (!canManageUsers && navigation.destination === Destination.USERS)
          return <></>;

        return (
          <NavigationListItem
            key={ navigation.destination }
            itemKey={ navigation.destination }
            navigation={ navigation }
            action={ () => props.onNavigate(navigation.destination!!) }
            isActive={ props.destination === navigation.destination }/>
        )

      })
    }</React.Fragment>
  );
}

export const TopNavigationComponent = (props: NavigationComponentPropsType) => {
  return (
    <TopNavigationList
      destination={ props.currentDestination }
      onNavigate={ props.onNavigate }
      items={ destinations }/>
  )
}

export const TopNavigationList = (props: NavigationListPropsType) => {
  const { canRead, canManageUsers } = usePermissions();

  return (
    <Grid
      container
      direction="row">
      { props.items.map((nav: NavigationItemType) => {
        if (!canRead && nav.destination === Destination.ASSETS)
          return <></>;
        if (!canManageUsers && nav.destination === Destination.USERS)
          return <></>;

        return (
          <TopNavigationItem
            key={ nav.destination }
            itemKey={ nav.destination }
            navigation={ nav }
            action={ () => props.onNavigate(nav.destination!!) }
            isActive={ props.destination === nav.destination }/>
        )
      })
      }
    </Grid>
  )
}

export const TopNavigationItem = (props: NavigationItemPropsType) => {
  const { t } = useTranslation();

  return (
    <Button
      sx={{
        margin: '0 0.2em',
        padding: '0.4em 1em',
        textTransform: 'none',
        fontWeight: '600',
        fontSize: '1em',
        color: (theme) => props.isActive ? theme.palette.primary.main : theme.palette.text.secondary
      }}
      key={ props.itemKey }
      onClick={ props.action }>
      { t(props.navigation.title) }
    </Button>
  );
}