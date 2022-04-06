import React, { ComponentClass, FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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

const destinations: NavigationItemType[] = [
  { icon: DesktopWindowsRounded, title: "navigation.assets", destination: Destination.ASSETS },
  { icon: Inventory2Outlined, title: "navigation.inventories", destination: Destination.INVENTORY },
  { icon: UploadFileOutlined, title: "navigation.issued", destination: Destination.ISSUED },
  { icon: LocalAtmOutlined, title: "navigation.stock_cards", destination: Destination.STOCK_CARD },
  { icon: PeopleOutlineRounded, title: "navigation.users", destination: Destination.USERS },
]

export const NavigationComponent = (props: NavigationComponentPropsType) => {
  const { status, user } = useAuthState();
  const [endSession, setEndSession] = useState(false);
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

  const onConfirmEndSession = () => setEndSession(true);
  const onDismissEndSession = () => setEndSession(false);
  const onEndSession = async () => {
    await signOut(auth);
    setEndSession(false);
  }

  return (
    <Box>
      <List
        sx={{ bgColor: 'background.paper' }}
        aria-labelledby="primary-route-subheader"
        subheader={
          <ListSubheader component="div" id="primary-route-subheader">{t("navigation.manage")}</ListSubheader>
        }>
        <NavigationList
          items={destinations}
          destination={props.currentDestination}
          onNavigate={props.onNavigate}/>
      </List>
      <Divider/>
      <List
        aria-labelledby="secondary-route-subheader"
        subheader={
          <ListSubheader component="div" id="secondary-route-subheader">{t("navigation.account")}</ListSubheader>
        }>
        <NavigationList
          items={minorDestinations}
          destination={props.currentDestination}
          onNavigate={props.onNavigate}/>
        <NavigationListItem
          itemKey={1}
          navigation={{ icon: ExitToAppRounded, title: t("button.sign_out") }}
          isActive={false}
          action={onConfirmEndSession}/>
      </List>
      <Dialog
        open={endSession}
        fullWidth={true}
        maxWidth="xs"
        onClose={onDismissEndSession}>
        <DialogTitle>{t("dialog.sign_out")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("dialog.sign_out_message")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={onDismissEndSession}>{t("button.cancel")}</Button>
          <Button
            color="primary"
            onClick={onEndSession}>{t("button.continue")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}


const NavigationListItem = (props: NavigationItemPropsType) => {
  const { t } = useTranslation();

  return (
    <ListItem
      button
      key={props.itemKey}
      selected={props.isActive}
      onClick={props.action}>
      <ListItemIcon>{
        React.createElement(props.navigation.icon)
      }
      </ListItemIcon>
      <ListItemText primary={t(props.navigation.title)}/>
    </ListItem>
  )
}

const NavigationList = (props: NavigationListPropsType) => {
  const { canRead, canManageUsers } = usePermissions();

  return (
    <>{
      props.items.map((navigation: NavigationItemType) => {
        if (!canRead && navigation.destination === Destination.ASSETS)
          return <></>;
        if (!canManageUsers && navigation.destination === Destination.USERS)
          return <></>;

        return (
          <NavigationListItem
            key={navigation.destination}
            itemKey={navigation.destination}
            navigation={navigation}
            action={() => props.onNavigate(navigation.destination!!)}
            isActive={props.destination === navigation.destination}/>
        )
      })
    }</>
  );
}

export const TopNavigationComponent = (props: NavigationComponentPropsType) => {
  return (
    <TopNavigationList
      destination={props.currentDestination}
      onNavigate={props.onNavigate}
      items={destinations}/>
  )
}

export const TopNavigationList = (props: NavigationListPropsType) => {
  const { canRead, canManageUsers } = usePermissions();

  return (
    <Grid
      container
      direction="row">
      {props.items.map((nav: NavigationItemType) => {
        if (!canRead && nav.destination === Destination.ASSETS)
          return <></>;
        if (!canManageUsers && nav.destination === Destination.USERS)
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
      key={props.itemKey}
      onClick={props.action}>
      {t(props.navigation.title)}
    </Button>
  );
}