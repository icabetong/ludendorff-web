import React, { FunctionComponent, ComponentClass } from "react";
import { IconButton, IconButtonProps } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(() => ({
  icon: {
    width: '1em',
    height: '1em'
  }
}));

type HeroIconButtonProps = {
  icon: FunctionComponent<any> | ComponentClass<any, any>
}

const HeroIconButton = (props: HeroIconButtonProps & IconButtonProps) => {
  const classes = useStyles();
  // removed the icon prop merged with the IconButtonProps
  // solution found here:
  // https://stackoverflow.com/questions/56155922/how-to-delete-property-from-spread-operator
  const { icon, ...iconButtonProps } = props;

  return (
    <IconButton {...iconButtonProps} size="large">
      {React.createElement(icon, { className: classes.icon })}
    </IconButton>
  );
}

export default HeroIconButton;