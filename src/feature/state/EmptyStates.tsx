import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
    root: {
        minHeight: '60vh'
    },
    text: {
        textAlign: 'center'
    }
}));

type EmptyStateComponentPropsType = {
    icon: JSX.Element,
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
                {props.icon}
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