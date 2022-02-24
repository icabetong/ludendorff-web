import React, { FunctionComponent, ComponentClass, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Icon,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Divider,
  Typography,
  makeStyles,
  alpha
} from "@material-ui/core";
import {
  AssignmentRounded,
  DesktopWindowsRounded,
  HomeRounded,
  PeopleOutlineRounded,
} from "@material-ui/icons";
import {
  // HomeIcon,
  // DesktopComputerIcon,
  // UserGroupIcon,
  // IdentificationIcon,
  CogIcon,
  UserIcon,
  LogoutIcon
} from "@heroicons/react/outline";
import clsx from "clsx";
import { signOut } from "firebase/auth";
import { AuthStatus, useAuthState, usePermissions } from "../auth/AuthProvider";
import { auth } from "../../index";

export enum Destination {
  HOME = 1,
  ASSETS,
  USERS,
  ASSIGNMENTS,
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
  currentDestination: Destination
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

const useStyles = makeStyles((theme) => ({
  inset: {
    marginBottom: '1em'
  },
  container: {
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      paddingLeft: '12px',
      paddingRight: '12px',
    },
    '& .MuiListItemIcon-root': {
      width: '1.6em',
      height: '1.6em',
      color: theme.palette.text.primary
    },
    '&$selected': {
      backgroundColor: theme.palette.type === 'dark' ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.primary.main, 0.2),
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

export const NavigationComponent = (props: NavigationComponentPropsType) => {
  const classes = useStyles();
  const { status, user } = useAuthState();
  const [triggerConfirmSignOut, setTriggerConfirmSignOut] = useState(false);
  const { t } = useTranslation();

  const destinations: NavigationItemType[] = [
    { icon: HomeRounded, title: "navigation.home", destination: Destination.HOME },
    { icon: DesktopWindowsRounded, title: "navigation.assets", destination: Destination.ASSETS },
    { icon: PeopleOutlineRounded, title: "navigation.users", destination: Destination.USERS },
    { icon: AssignmentRounded, title: "navigation.assignments", destination: Destination.ASSIGNMENTS },
  ]

  const minorDestinations: NavigationItemType[] = [
    {
      icon: UserIcon,
      title: status === AuthStatus.FETCHED && user?.firstName !== undefined
        ? user!.firstName
        : t("profile"),
      destination: Destination.PROFILE
    },
    { icon: CogIcon, title: "navigation.settings", destination: Destination.SETTINGS },
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
      <Box className="inset" />
      <ListSubheader>{t("navigation.manage")}</ListSubheader>
      <List className={classes.navigation}>
        <NavigationList
          items={destinations}
          destination={props.currentDestination}
          onNavigate={props.onNavigate} />
      </List>
      <Divider />
      <ListSubheader>{t("navigation.account")}</ListSubheader>
      <List className={classes.navigation}>
        <NavigationList
          items={minorDestinations}
          destination={props.currentDestination}
          onNavigate={props.onNavigate} />
        <NavigationListItem
          itemKey={1}
          navigation={{ icon: LogoutIcon, title: t("button.signout") }}
          isActive={false}
          action={() => confirmSignOut()} />
      </List>
      <Dialog
        open={triggerConfirmSignOut}
        fullWidth={true}
        maxWidth="xs"
        onClose={() => setTriggerConfirmSignOut(false)}>
        <DialogTitle>{t("dialog.signout")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("dialog.signout_message")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => setTriggerConfirmSignOut(false)}>{t("button.cancel")}</Button>
          <Button color="primary" onClick={triggerSignOut}>{t("button.continue")}</Button>
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
      classes={{ root: classes.container, selected: classes.selected }}
      key={props.itemKey}
      selected={props.isActive}
      onClick={props.action}>
      <ListItemIcon>{
        React.createElement(props.navigation.icon)
      }
      </ListItemIcon>
      <ListItemText primary={<Typography variant="body2">{t(props.navigation.title)}</Typography>} />
    </ListItem>
  )
}

const NavigationList = (props: NavigationListPropsType) => {
  const { canRead, canManageUsers, isAdmin } = usePermissions();

  return (
    <React.Fragment>{
      props.items.map((navigation: NavigationItemType) => {
        if (!canRead && navigation.destination === Destination.ASSETS)
          return <></>;
        if (!canManageUsers && navigation.destination === Destination.USERS)
          return <></>;
        if (!isAdmin && navigation.destination === Destination.ASSIGNMENTS)
          return <></>;

        return <NavigationListItem
          key={navigation.destination}
          itemKey={navigation.destination}
          navigation={navigation}
          action={() => props.onNavigate(navigation.destination!!)}
          isActive={props.destination === navigation.destination} />

      })
    }</React.Fragment>
  );
}



export const TopNavigationComponent = (props: NavigationComponentPropsType) => {
  const destinations: NavigationItemType[] = [
    { icon: HomeRounded, title: "navigation.home", destination: Destination.HOME },
    { icon: DesktopWindowsRounded, title: "navigation.assets", destination: Destination.ASSETS },
    { icon: PeopleOutlineRounded, title: "navigation.users", destination: Destination.USERS },
    { icon: AssignmentRounded, title: "navigation.assignments", destination: Destination.ASSIGNMENTS },
  ]

  return <TopNavigationList destination={props.currentDestination} onNavigate={props.onNavigate} items={destinations}/>
}

export const TopNavigationList = (props: NavigationListPropsType) => {
  const { canRead, canManageUsers, isAdmin } = usePermissions();

  return (
    <Grid container direction="row" justifyContent="space-between">
    { props.items.map((nav: NavigationItemType) => {
        if (!canRead && nav.destination === Destination.ASSETS)
        return <></>;
        if (!canManageUsers && nav.destination === Destination.USERS)
          return <></>;
        if (!isAdmin && nav.destination === Destination.ASSIGNMENTS)
          return <></>;

        return (
          <TopNavigationItem
            key={nav.destination}
            itemKey={nav.destination}
            navigation={nav}
            action={() => props.onNavigate(nav.destination!!)}
            isActive={props.destination === nav.destination}/>
        )
    })
    }
    </Grid>
  )
}

const useCustomButtonStyles = makeStyles((theme) => ({
  item: {
    padding: '0.4em 1.8em',
    textTransform: 'none',
  },
  active: {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    color: theme.palette.primary.main,
  }
}));

export const TopNavigationItem = (props: NavigationItemPropsType) => {
  const classes = useCustomButtonStyles();
  const { t } = useTranslation();

  const classNames = clsx(classes.item, props.isActive ? classes.active : undefined)

  return (
    <Button
      className={classNames}
      key={props.itemKey}
      startIcon={React.createElement(props.navigation.icon)}
      onClick={props.action}>
      {t(props.navigation.title)}
    </Button>
  );
}