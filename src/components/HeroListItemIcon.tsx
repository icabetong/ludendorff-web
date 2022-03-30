import React, { FunctionComponent, ComponentClass } from "react";
import { ListItemIcon } from "@mui/material/";
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(() => ({
  icon: { width: '1em', height: '1em' }
}))

type HeroListItemIconProps = {
  icon: FunctionComponent<any> | ComponentClass<any, any>
}

const HeroListItemIcon = (props: HeroListItemIconProps) => {
  const classes = useStyles();

  return (
    <ListItemIcon>{React.createElement(props.icon, { className: classes.icon })}</ListItemIcon>
  )
}

export default HeroListItemIcon;