import React, { FunctionComponent, ComponentClass } from "react";
import { useTranslation } from "react-i18next";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import {
  IdentificationIcon,
  OfficeBuildingIcon,
} from "@heroicons/react/outline";

import { User } from "../user/User";

const useStyles = makeStyles((theme) => ({
  icon: { width: '2em', height: '2em' },
  container: {
    minWidth: '100%',
    '& .MuiListItem-root': {
      borderRadius: theme.spacing(1)
    }
  }
}))

type ProfileInfo = {
  icon: FunctionComponent<any> | ComponentClass<any, any>,
  name: string,
  info?: string
}

type ProfileInfoListProps = {
  user?: User
}

const ProfileInfoList = (props: ProfileInfoListProps) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const info = [
    { icon: IdentificationIcon, name: 'field.position', info: props.user?.position },
    { icon: OfficeBuildingIcon, name: 'field.department', info: props.user?.department?.name }
  ]

  return (
    <>
      <ListSubheader>{t("information")}</ListSubheader>
      <List className={classes.container}>
        {info.map((i) => <ProfileInfoItem info={i} />)}
      </List>
    </>
  )
}

type ProfileInfoItemProps = {
  info: ProfileInfo
}

const ProfileInfoItem = (props: ProfileInfoItemProps) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <ListItem
      key={props.info.name}>
      <ListItemIcon>
        {
          React.createElement(props.info.icon, { className: classes.icon })
        }
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="overline">{t(props.info.name)}</Typography>
        }
        secondary={
          <Typography variant="subtitle2">{props.info.info === undefined ? t("unknown") : props.info.info}</Typography>
        } />
    </ListItem>
  )
}

export default ProfileInfoList;