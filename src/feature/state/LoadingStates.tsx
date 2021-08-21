import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import { ReactComponent as Logo } from "../../shared/icon.svg";

const useStyles = makeStyles(() => ({
    root: {
        width: '100vw',
        height: '100vh'
    },
    rootContent: {
        width: '100%',
        height: '100%',
    },
    wrapper: {
        width: 'fit-content',
        height: 'fit-content'
    },
    icon: {
        display: 'block',
        margin: 'auto',
        fontSize: '8em'
    },
    progress: {
        margin: 'auto'
    },
}));

export const MainLoadingStateComponent = () => {
    const classes = useStyles();
    const theme = useTheme();

    return (
        <Grid container direction="column" alignItems="center" justifyContent="center" className={classes.root}>
            <Grid item className={classes.wrapper}>
                <Logo fill={theme.palette.primary.main} stroke={theme.palette.primary.main} className={classes.icon}/>
                <LinearProgress className={classes.progress}/>
            </Grid>
        </Grid>
    )
}

export const ContentLoadingStateComponent = () => {
    const classes = useStyles();
    
    return (
        <Grid container direction="column" alignItems="center" justifyContent="center" className={classes.rootContent}>
            <Grid item className={classes.wrapper}>
                <CircularProgress className={classes.progress}/>
            </Grid>
        </Grid>
    )
}