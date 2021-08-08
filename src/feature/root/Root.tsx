import { useContext, useState } from "react";
import { Redirect } from "react-router";
import { CircularProgress, Grid, Container, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { AuthContext, AuthPending } from "../auth/AuthProvider";
import { HomeComponent } from "../home/HomeComponent";
import { ScanComponent } from "../scan/ScanComponent";
import { AssetComponent } from "../asset/AssetComponent";
import { UserComponent } from "../user/UserComponent";
import { AssignmentComponent } from "../assignment/AssignmentComponent";
import { ErrorComponent } from "../error/ErrorComponent";
import { Destination, NavigationComponent } from "../navigation/NavigationComponent";
import { SettingsComponent } from "../settings/SettingsComponent";

type InnerComponentPropsType = {
    destination: Destination
}

const InnerComponent = (props: InnerComponentPropsType) => {
    switch(props.destination) {
        case Destination.HOME:
            return <HomeComponent/>
        case Destination.SCAN:
            return <ScanComponent/>
        case Destination.ASSETS:
            return <AssetComponent/>
        case Destination.USERS:
            return <UserComponent/>
        case Destination.ASSIGNMENTS:
            return <AssignmentComponent/>
        case Destination.SETTINGS:
            return <SettingsComponent/>
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
    children: JSX.Element,
}

const RootContainerComponent = (props: RootContainerComponentPropsType) => {
    const useStyles = makeStyles((theme) => ({
        root: {
            minWidth: '100vw',
            minHeight: '100vh'
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
            width: '100%',
            height: '100%'
        }
    }));
    const classes = useStyles();

    return (
        <Container disableGutters={true} className={classes.root}>
            <Grid container direction="row" className={classes.root}>
                <Grid container item xs={1} md={2} justifyContent="center" wrap="nowrap">
                    <Container disableGutters={true} className={classes.container}>
                        <NavigationComponent onNavigate={props.onNavigate} currentDestination={props.currentDestination}/>
                    </Container>
                </Grid>
                <Grid container item xs={11} md={10}>
                    <Paper className={classes.content} variant="outlined" square>
                        {props.children}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
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
    } else {
        if (authState.user != null) {
            return (
                <RootContainerComponent onNavigate={onNavigate} currentDestination={destination}>
                    <InnerComponent destination={destination} />
                </RootContainerComponent>
            )
        } else return <Redirect to="/auth"/>
    }
}
export default RootComponent