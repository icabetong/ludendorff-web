import { useContext, useState } from "react";
import { Redirect } from "react-router";
import { withRouter } from "react-router-dom";
import { CircularProgress } from "@material-ui/core/";
import Drawer from "@material-ui/core/Drawer";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Paper from "@material-ui/core/Paper";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import { AuthContext, AuthFetched, AuthPending } from "../auth/AuthProvider";
import { HomeComponent } from "../home/HomeComponent";
import { ScanComponent } from "../scan/ScanComponent";
import { AssetComponent } from "../asset/AssetComponent";
import { UserComponent } from "../user/UserComponent";
import { AssignmentComponent } from "../assignment/AssignmentComponent";
import { ErrorComponent } from "../error/ErrorComponent";
import { Destination, NavigationComponent } from "../navigation/NavigationComponent";
import { SettingsComponent } from "../settings/SettingsComponent";

type InnerComponentPropsType = {
    destination: Destination,
    onDrawerToggle: () => void,
}

const InnerComponent = (props: InnerComponentPropsType) => {
    switch(props.destination) {
        case Destination.HOME:
            return <HomeComponent onDrawerToggle={props.onDrawerToggle}/>
        case Destination.SCAN:
            return <ScanComponent onDrawerToggle={props.onDrawerToggle}/>
        case Destination.ASSETS:
            return <AssetComponent onDrawerToggle={props.onDrawerToggle}/>
        case Destination.USERS:
            return <UserComponent onDrawerToggle={props.onDrawerToggle}/>
        case Destination.ASSIGNMENTS:
            return <AssignmentComponent onDrawerToggle={props.onDrawerToggle}/>
        case Destination.SETTINGS:
            return <SettingsComponent onDrawerToggle={props.onDrawerToggle}/>
        default:
            return <ErrorComponent/>
    }
}

const LoadingScreenComponent = () => {
    const style = {
        minHeight: '100vh'
    }

    return (
        <Grid container direction="row" alignItems="center" justifyContent="center" style={style}>
            <CircularProgress/>
        </Grid>
    )
}

type RootContainerComponentPropsType = {
    onNavigate: (destination: Destination) => void,
    currentDestination: Destination,
}

const RootContainerComponent = (props: RootContainerComponentPropsType) => {
    const drawerWidth = 240;
    const useStyles = makeStyles((theme) => ({
        root: {
            display: 'flex',
            width: '100vw',
            height: '100vh'
        },
        drawer: {
            [theme.breakpoints.up('sm')]: {
                width: drawerWidth,
                flexShrink: 0,
            }
        },
        drawerPaper: {
            width: drawerWidth,
        },
        container: {
            minWidth: '100%',
            minHeight: '100%',
        }, 
        icon: {
            maxWidth: '2em',
            maxHeight: '2em',
        },
        content: {
            flexGrow: 1,
        },
        contentPaper: {
            width: '100%',
            height: '100%'
        }
    }));
    const classes = useStyles();
    const theme = useTheme();

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    const onToggleDrawerState = () => {
        setDrawerOpen(!drawerOpen);
    }

    const drawerItems = (
        <NavigationComponent 
            onNavigate={props.onNavigate} 
            currentDestination={props.currentDestination}/>
    )

    return (
        <div className={classes.root}>
            <nav className={classes.drawer}>
                <Hidden smUp implementation="css">
                    <Drawer 
                        variant="temporary"
                        anchor={theme.direction === "rtl" ? 'right' : 'left' }
                        open={drawerOpen}
                        onClose={onToggleDrawerState}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true,
                        }}>
                        {drawerItems}
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="css">
                    <Drawer 
                        className={classes.drawer}
                        variant="permanent"
                        classes={{
                            paper: classes.drawerPaper,
                        }}>
                        {drawerItems}
                    </Drawer>
                </Hidden>
            </nav>
            <div className={classes.content}>
                <Paper variant="outlined" square className={classes.contentPaper}>
                    <InnerComponent destination={props.currentDestination} onDrawerToggle={onToggleDrawerState}/>
                </Paper>    
            </div>
        </div>
    );
}

const RootComponent = () => {
    const authState = useContext(AuthContext);
    const [destination, setDestination] = useState<Destination>(Destination.ASSETS);

    const onNavigate = (newDestination: Destination) => {
        setDestination(newDestination)
    }

    if (authState instanceof AuthPending) {
        return <LoadingScreenComponent/>
    } else if (authState instanceof AuthFetched) {
        if (authState.user != null) {
            return (
                <RootContainerComponent 
                    onNavigate={onNavigate} 
                    currentDestination={destination}/>
            )
        } else {
            console.log("redirected");
            return <Redirect to="/auth"/>
        }
    } else return <Redirect to="/error"/>
}
export default withRouter(RootComponent);