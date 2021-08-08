import { useContext, useState } from "react"
import { Redirect } from "react-router"
import { CircularProgress, Grid, Container, Paper } from "@material-ui/core"

import "./Root.scss";
import { AuthContext, AuthPending } from "../auth/AuthProvider"
import { HomeComponent } from "../home/HomeComponent"
import { AssetComponent } from "../asset/AssetComponent"
import { UserComponent } from "../user/UserComponent"
import { ErrorComponent } from "../error/ErrorComponent"
import { Destination, NavigationComponent } from "../navigation/NavigationComponent";

type RootContainerComponentProps = {
    destination: Destination
}

const RootContainerComponent = (props: RootContainerComponentProps) => {
    switch(props.destination) {
        case Destination.HOME:
            return <HomeComponent/>
        case Destination.ASSETS:
            return <AssetComponent/>
        case Destination.USERS:
            return <UserComponent/>
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

type InnerComponentPropsType = {
    onNavigate: Function,
    children: JSX.Element
}

const InnerComponent = (props: InnerComponentPropsType) => {
    return (
        <Container disableGutters={true} className="inner-component-root">
            <Grid container direction="row" className="grid-component-root">
                <Grid container item xs={2}>
                    <NavigationComponent onNavigate={props.onNavigate}/>
                </Grid>
                <Grid container item xs={10}>
                    <Paper className="main-content">
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
                <div>
                    <InnerComponent onNavigate={onNavigate}>
                        <RootContainerComponent destination={destination}/>
                    </InnerComponent>
                </div>
            )
        } else return <Redirect to="/auth"/>
    }
}
export default RootComponent