import React, { FunctionComponent, ComponentClass } from "react";
import { IconButton, IconButtonProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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
        <IconButton {...iconButtonProps}>
        { React.createElement(icon, { className: classes.icon }) }
        </IconButton>
    )
}

export default HeroIconButton;