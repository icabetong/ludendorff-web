import React, { FunctionComponent, ComponentClass } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
    root: {
        minHeight: '60vh'
    },
    icon: {
        width: '4em',
        height: '4em'
    },
    text: {
        textAlign: 'center'
    }
}));

type EmptyStateComponentPropsType = {
    icon: FunctionComponent<any> | ComponentClass<any, any>,
    title: string,
    subtitle: string
}

const EmptyStateComponent = (props: EmptyStateComponentPropsType) => {
    const classes = useStyles();

    return (
        <Grid 
            container 
            direction="column" 
            alignItems="center" 
            justifyContent="center" 
            className={classes.root}>
            <Grid item>
                { React.createElement(props.icon, { className: classes.icon }) }
            </Grid>
            <Grid item>
                <Typography variant="h6" className={classes.text}>{ props.title }</Typography>    
            </Grid>
            <Grid item>
                <Typography variant="subtitle1" className={classes.text}>{ props.subtitle }</Typography>
            </Grid>
        </Grid>
    )
}

export default EmptyStateComponent;