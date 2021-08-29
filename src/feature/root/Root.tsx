import { useState, Suspense, lazy } from "react";
import { Redirect } from "react-router";
import { withRouter } from "react-router-dom";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { SnackbarProvider } from "notistack";

import { AuthStatus, useAuthState } from "../auth/AuthProvider";

import { Destination, NavigationComponent } from "../navigation/NavigationComponent";
import { ErrorNotFoundState } from "../state/ErrorStates";
import { MainLoadingStateComponent, ContentLoadingStateComponent } from "../state/LoadingStates";

const HomeScreen = lazy(() => import('../home/HomeScreen'));
const ScanScreen = lazy(() => import('../scan/ScanScreen'));
const AssetScreen = lazy(() => import('../asset/AssetScreen'));
const UserScreen = lazy(() => import('../user/UserScreen'));
const AssignmentScreen = lazy(() => import('../assignment/AssignmentScreen'));
const ProfileScreen = lazy(() => import('../profile/ProfileScreen'));
const SettingsScreen = lazy(() => import('../settings/SettingsScreen'));

type InnerComponentPropsType = {
    destination: Destination,
    onDrawerToggle: () => void,
}

const InnerComponent = (props: InnerComponentPropsType) => {
    switch(props.destination) {
        case Destination.HOME:
            return <HomeScreen onDrawerToggle={props.onDrawerToggle}/>
        case Destination.SCAN:
            return <ScanScreen onDrawerToggle={props.onDrawerToggle}/>
        case Destination.ASSETS:
            return <AssetScreen onDrawerToggle={props.onDrawerToggle}/>
        case Destination.USERS:
            return <UserScreen onDrawerToggle={props.onDrawerToggle}/>
        case Destination.ASSIGNMENTS:
            return <AssignmentScreen onDrawerToggle={props.onDrawerToggle}/>
        case Destination.PROFILE:
            return <ProfileScreen onDrawerToggle={props.onDrawerToggle}/>
        case Destination.SETTINGS:
            return <SettingsScreen onDrawerToggle={props.onDrawerToggle}/>
        default:
            return <ErrorNotFoundState/>
    }
}

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        width: '100vw',
        height: '100vh'
    },
    drawer: {
        [theme.breakpoints.up('md')]: {
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
    headerIcon: {
        fontSize: '1em',
        display: 'block',
        margin: 'auto'
    },
    header: {
        display: 'block',
        textAlign: 'center'
    }
}));

type RootContainerComponentPropsType = {
    onNavigate: (destination: Destination) => void,
    currentDestination: Destination,
}

const RootContainerComponent = (props: RootContainerComponentPropsType) => {
    const classes = useStyles();
    const theme = useTheme();

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    const onToggleDrawerState = () => {
        setDrawerOpen(!drawerOpen);
    }

    const onNavigateThenDismiss = (destination: Destination) => {
        setDrawerOpen(false)
        props.onNavigate(destination)
    }

    const drawerItems = (
        <NavigationComponent 
            onNavigate={onNavigateThenDismiss} 
            currentDestination={props.currentDestination}/>
    )

    return (
        <div className={classes.root}>
            <nav className={classes.drawer}>
                <Hidden mdUp implementation="css">
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
                <Hidden smDown implementation="css">
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
                <Suspense fallback={<ContentLoadingStateComponent/>}>
                    <InnerComponent destination={props.currentDestination} onDrawerToggle={onToggleDrawerState}/>
                </Suspense>
            </div>
        </div>
    );
}

const RootComponent = () => {
    const { status, user } = useAuthState();
    const [destination, setDestination] = useState<Destination>(Destination.ASSETS);

    const onNavigate = (newDestination: Destination) => {
        setDestination(newDestination)
    }

    if (status === AuthStatus.PENDING) {
        return <MainLoadingStateComponent/>
    } else if (status === AuthStatus.FETCHED) {
        if (user !== undefined) {
            return (
                <SnackbarProvider 
                    maxSnack={3}
                    autoHideDuration={3000}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                    }}>
                    <RootContainerComponent 
                        onNavigate={onNavigate} 
                        currentDestination={destination}/>
                </SnackbarProvider>
            )
        } else return <Redirect to="/auth"/>
    } else return <Redirect to="/error"/>
}
export default withRouter(RootComponent);