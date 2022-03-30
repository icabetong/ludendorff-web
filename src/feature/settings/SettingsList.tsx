import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction, Theme
} from "@mui/material";

import { Setting } from "./Settings";

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    width: '1.2em',
    height: '1.2em',
    color: theme.palette.text.primary
  }
}));

type SettingsListProps = {
  preferences: Setting[]
}

const SettingsList = (props: SettingsListProps) => {
  return (
    <List>
      {props.preferences.map((preference: Setting) => {
        return <SettingsItem preference={preference} />
      })
      }
    </List>
  );
}

type SettingsItemProp = {
  preference: Setting
}

const SettingsItem = (props: SettingsItemProp) => {
  const classes = useStyles();

  return (
    <ListItem key={props.preference.key}>
      {props.preference.icon &&
        <ListItemIcon>
          {React.createElement(props.preference.icon,
            { className: classes.icon })
          }
        </ListItemIcon>
      }
      <ListItemText
        primary={props.preference.title}
        secondary={props.preference.summary} />
      {props.preference.action &&
        <ListItemSecondaryAction>{props.preference.action}</ListItemSecondaryAction>
      }
    </ListItem>
  )
}

export default SettingsList;