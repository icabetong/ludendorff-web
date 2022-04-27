import React, { ComponentClass, FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { List, ListItem, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import { WorkOutlineRounded, } from "@mui/icons-material";

import { User } from "../user/User";

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

  const info = [
    { icon: WorkOutlineRounded, name: 'field.position', info: props.user?.position },
  ]

  return (
    <List
      aria-labelledby="information-subheader"
      subheader={
        <ListSubheader
          component="div"
          id="information-subheader">
          {t("information")}
        </ListSubheader>
      }>
      {info.map((info) => <ProfileInfoItem key={info.name} info={info}/>)}
    </List>
  )
}

type ProfileInfoItemProps = {
  info: ProfileInfo
}
const ProfileInfoItem = (props: ProfileInfoItemProps) => {
  const { t } = useTranslation();

  return (
    <ListItem
      key={props.info.name}>
      <ListItemIcon>
        {React.createElement(props.info.icon)}
      </ListItemIcon>
      <ListItemText
        primary={props.info.info === undefined ? t("unknown") : props.info.info}
        secondary={t(props.info.name)}/>
    </ListItem>
  )
}

export default ProfileInfoList;