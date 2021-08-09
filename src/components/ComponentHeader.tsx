import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Menu } from "@material-ui/icons/";

type ComponentHeaderPropsType = {
    title: string,
    onDrawerToggle: () => void
}

export const ComponentHeader = (props: ComponentHeaderPropsType) => {
    const useStyles = makeStyles((theme) => ({
        appBar: {
            zIndex: theme.zIndex.drawer + 1,
        },
        toolbar: theme.mixins.toolbar,
        navigationButton: {
            marginRight: theme.spacing(2),
            [theme.breakpoints.up('sm')]: {
                display: 'none'
            },
        },
    }));
    const classes = useStyles();

    return (
        <AppBar position="static" className={classes.appBar} color="transparent" elevation={0}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="Open Drawer"
                    edge="start"
                    onClick={props.onDrawerToggle}
                    className={classes.navigationButton}>
                        <Menu/>
                </IconButton>
                <Hidden only="xs">
                    <Typography variant="h5" noWrap>
                        {props.title}
                    </Typography>
                </Hidden>
                <Hidden only={['sm', 'md', 'lg', 'xl']}>
                    <Typography variant="h6" noWrap>
                        {props.title}
                    </Typography>
                </Hidden>
            </Toolbar>
        </AppBar>
    )
}