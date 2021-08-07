import { useContext, useState } from "react"
import { Redirect } from "react-router"
import { CircularProgress, Grid } from "@material-ui/core"

import "./Root.scss";
import { AuthContext, AuthPending } from "../auth/AuthProvider"
import { HomeComponent } from "../home/HomeComponent"
import { AssetComponent } from "../asset/AssetComponent"
import { UserComponent } from "../user/UserComponent"
import { ErrorComponent } from "../error/ErrorComponent"

enum Destination {
    HOME, SCAN, ASSETS, USERS, ASSIGNMENTS
}

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
                    <button onClick={() => onNavigate(Destination.HOME)}>Home</button>
                    <button onClick={() => onNavigate(Destination.ASSETS)}>Assets</button>
                    <button onClick={() => onNavigate(Destination.USERS)}>Users</button>
                    <RootContainerComponent destination={destination}/>
                </div>
            )
        } else return <Redirect to="/auth"/>
    }
}
export default RootComponent