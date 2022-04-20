import React, { ComponentClass, FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Grid,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import {
  DesktopWindowsRounded,
  Inventory2Outlined,
  LocalAtmOutlined,
  PeopleOutlineRounded,
  SettingsOutlined,
  UploadFileOutlined
} from "@mui/icons-material";
import { useAuthState, usePermissions } from "../auth/AuthProvider";
import { NavigationList, NavigationListItem } from "./NavigationList";
import { getHostOperatingSystem } from "../../shared/utils";

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
  const { user } = useAuthState();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme => theme.palette.divider
      }}>
      <NavigationList
        key="primary-routes"
        current={props.currentDestination}
        onNavigate={props.onNavigate}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
        { user &&
          <Box sx={{ padding: 2, textOverflow: 'ellipsis', mb: 2 }}>
            <Paper variant="outlined">
              <ListItemButton
                onClick={() => props.onNavigate(Destination.PROFILE)}>
                <ListItemText
                  primary={
                    <Typography noWrap sx={{ fontWeight: 500 }}>
                      {t("template.full_name", { last: user.lastName, first: user.firstName })}
                    </Typography>
                  }
                  secondary={
                    <Typography noWrap sx={{ fontSize: '0.8em', fontWeight: 400 }}>
                      {user.email}
                    </Typography>
                  }/>
              </ListItemButton>
            </Paper>
          </Box>
        }
        <Box sx={{ flex: 1 }}>
          {
            destinations.map((item) => {
              return (
                <NavigationListItem
                  key={item.destination}
                  itemKey={item.destination}
                  icon={item.icon}
                  title={item.title}
                  active={props.currentDestination === item.destination}
                  onNavigate={() => {
                    item.destination && props.onNavigate(item.destination)
                  }}/>
              )
            })
          }
        </Box>
        { getHostOperatingSystem() === 'Android'
          &&
          <Box sx={{ padding: 2 }}>
            <Alert severity="info">
              {t("info.native_app_available")}
            </Alert>
          </Box>
        }
        <Box sx={{ mb: 1 }}>
          <NavigationListItem
            itemKey={Destination.SETTINGS}
            icon={SettingsOutlined}
            title="navigation.settings"
            onNavigate={() => props.onNavigate(Destination.SETTINGS)}/>
        </Box>
      </NavigationList>
    </Box>
  )
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