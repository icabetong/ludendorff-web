import React, { ComponentClass, FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";

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

  return (
    <List
      aria-labelledby="actions-subheader"
      subheader={
        <ListSubheader
          component="div"
          id="actions-subheader">
          {t("actions")}
        </ListSubheader>
      }>
      {props.actions.map((action) =>
        <ProfileActionItem
          key={action.key}
          action={action}/>
      )}
    </List>
  )
}

type ProfileActionItemProps = {
  action: ProfileAction
}
const ProfileActionItem = (props: ProfileActionItemProps) => {
  const { t } = useTranslation();
  const onHandleClick = () => props.action.action();

  return (
    <ListItemButton
      key={props.action.key}
      onClick={onHandleClick}>
      <ListItemIcon>
        {React.createElement(props.action.icon)}
      </ListItemIcon>
      <ListItemText
        primary={t(props.action.title)}/>
    </ListItemButton>
  )
}

export default ProfileActionList;