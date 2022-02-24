import React, { FunctionComponent, ComponentClass } from "react";
import { useTranslation } from "react-i18next";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  icon: { 
    width: '1.2em', 
    height: '1.2em',
  },
  container: {
    width: '100%',
    '& .MuiListItem-root': {
      borderRadius: theme.spacing(1)
    }
  }
}));

type ProfileAction = {
  key: string,
  icon: FunctionComponent<any> | ComponentClass<any, any>,
  title: string,
  action: () => void
}

type ProfileActionListProps = {
  actions: ProfileAction[]
}

const ProfileActionList = (props: ProfileActionListProps) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <ListSubheader>{t("actions")}</ListSubheader>
      <List className={classes.container}>
        {props.actions.map((action) =>
          <ProfileActionItem action={action} />
        )}
      </List>
    </>
  )
}

type ProfileActionItemProps = {
  action: ProfileAction
}
const ProfileActionItem = (props: ProfileActionItemProps) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <ListItem
      button
      key={props.action.key}
      onClick={() => props.action.action()}>
      <ListItemIcon>
        {
          React.createElement(props.action.icon,
            { className: classes.icon })
        }
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2">{t(props.action.title)}</Typography>
        } />
    </ListItem>
  )
}

export default ProfileActionList;