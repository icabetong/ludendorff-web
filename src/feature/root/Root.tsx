import { useContext, useState } from "react"
import { Redirect } from "react-router"
import { CircularProgress, Grid } from "@material-ui/core"

import { AuthContext, AuthPending } from "../auth/AuthProvider"
import { HomeComponent } from "../home/HomeComponent"
import { AssetComponent } from "../asset/AssetComponent"
import { UserComponent } from "../user/UserComponent"
import "./Root.scss";

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
            return <LoadingScreenComponent/>
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

    const onNavigate = () => {
        // todo
    }

    if (authState instanceof AuthPending) {
        return <LoadingScreenComponent/>
    } else {
        if (authState.user != null) {
            return (
                <div>
                    <button onClick={onNavigate}>Change</button>
                    <RootContainerComponent destination={destination}/>
                </div>
            )
        } else return <Redirect to="/auth"/>
    }
}
export default RootComponent