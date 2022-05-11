import React, { ComponentClass, FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  ListItemButton,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  DevicesOtherRounded,
  Inventory2Outlined,
  LocalAtmOutlined,
  PeopleOutlineRounded,
  SettingsOutlined,
  UploadFileOutlined
} from "@mui/icons-material";
import { useAuthState } from "../auth/AuthProvider";
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

type NavigationContainerProps = {
  destination: Destination,
  onNavigate: (destination: Destination) => void,
  onSignOut: (element: HTMLDivElement) => void,
}

const destinations: NavigationItemType[] = [
  { icon: DevicesOtherRounded, title: "navigation.assets", destination: Destination.ASSETS },
  { icon: Inventory2Outlined, title: "navigation.inventories", destination: Destination.INVENTORY },
  { icon: UploadFileOutlined, title: "navigation.issued", destination: Destination.ISSUED },
  { icon: LocalAtmOutlined, title: "navigation.stock_cards", destination: Destination.STOCK_CARD },
  { icon: PeopleOutlineRounded, title: "navigation.users", destination: Destination.USERS },
]

export const NavigationContainer = (props: NavigationContainerProps) => {
  const { user } = useAuthState();
  const { t } = useTranslation();

  const onAccountBoxClicked = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => props.onSignOut(e.currentTarget);

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
        current={props.destination}
        onNavigate={props.onNavigate}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <Toolbar/>
        <Box sx={{ flex: 1 }}>
          {
            destinations.map((item) => {
              return (
                <NavigationListItem
                  key={item.destination}
                  itemKey={item.destination}
                  icon={item.icon}
                  title={item.title}
                  active={props.destination === item.destination}
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
        { user &&
          <Box sx={{ padding: 2, textOverflow: 'ellipsis' }}>
            <Paper variant="outlined">
              <ListItemButton
                onClick={onAccountBoxClicked}>
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