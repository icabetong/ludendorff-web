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
  ChevronRightRounded,
  DevicesOtherRounded,
  Inventory2Outlined,
  LocalAtmOutlined,
  PeopleOutlineRounded,
  UploadFileOutlined,
  QueryStatsRounded
} from "@mui/icons-material";
import { useAuthState, usePermissions } from "../auth/AuthProvider";
import { NavigationList, NavigationListItem } from "./NavigationList";
import { getHostOperatingSystem } from "../../shared/utils";

export type Destination = "assets" | "inventories" | "issued" | "stockCards" | "auditLogs" | "users" | "account" | "settings";

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
  { icon: DevicesOtherRounded, title: "navigation.assets", destination: "assets" },
  { icon: Inventory2Outlined, title: "navigation.inventories", destination: "inventories" },
  { icon: UploadFileOutlined, title: "navigation.issued", destination: "issued" },
  { icon: LocalAtmOutlined, title: "navigation.stock_cards", destination: "stockCards" },
  { icon: QueryStatsRounded, title: "navigation.audit_logs", destination: "auditLogs" },
  { icon: PeopleOutlineRounded, title: "navigation.users", destination: "users" },
]

export const NavigationContainer = (props: NavigationContainerProps) => {
  const { user } = useAuthState();
  const { isAdmin } = usePermissions();
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
        <Box sx={{ flex: 1, marginTop: 2 }}>
          {
            destinations.map((item) => {
              console.log(item.destination === 'users' && isAdmin)
              if ((item.destination === 'users' || item.destination === 'auditLogs') && !isAdmin)
                return (<></>)

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
                      {user.firstName}
                    </Typography>
                  }
                  secondary={
                    <Typography noWrap sx={{ fontSize: '0.8em', fontWeight: 400 }}>
                      {user.email}
                    </Typography>
                  }/>
                <ChevronRightRounded/>
              </ListItemButton>
            </Paper>
          </Box>
        }
      </NavigationList>
    </Box>
  )
}