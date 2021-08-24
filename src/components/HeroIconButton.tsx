import React, { FunctionComponent, ComponentClass } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, IconButtonProps } from "@material-ui/core";

const useStyles = makeStyles(() => ({
    icon: {
        width: '1em',
        height: '1em'
    }
}));

type HeroIconButtonProps = {
    icon: FunctionComponent<any> | ComponentClass<any, any>,
    iconProps?: any
}

const HeroIconButton = (props: HeroIconButtonProps & IconButtonProps) => {
    const classes = useStyles();
    
    return (
        <IconButton {...props}>
        { React.createElement(props.icon, { className: classes.icon }) }
        </IconButton>
    )
}

export default HeroIconButton;