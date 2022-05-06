import React from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText
} from "@mui/material";
import { Setting } from "./Settings";

type SettingsListProps = {
  preferences: Setting[]
}

const SettingsList = (props: SettingsListProps) => {
  return (
    <List>
      {props.preferences.map((preference: Setting) => {
        return (
          <SettingsItem
            key={preference.key}
            preference={preference}/>
        )
      })
      }
    </List>
  );
}

type SettingsItemProp = {
  preference: Setting
}

const SettingsItem = (props: SettingsItemProp) => {
  return (
    <ListItem key={props.preference.key}>
      {props.preference.icon &&
        <ListItemIcon>
          {React.createElement(props.preference.icon)}
        </ListItemIcon>
      }
      <ListItemText
        inset={!Boolean(props.preference.icon)}
        primary={props.preference.title}
        secondary={props.preference.summary}/>
      {props.preference.action &&
        <ListItemSecondaryAction>{props.preference.action}</ListItemSecondaryAction>
      }
    </ListItem>
  )
}

export default SettingsList;