import { useContext } from "react"
import { Redirect } from "react-router"
import {CircularProgress, Grid} from "@material-ui/core"

import { AuthContext, AuthPending } from "../auth/AuthProvider"
import "./Root.scss";
import { AssetComponent } from "../asset/AssetComponent";

const RootContainerComponent = () => {
    return(
        <AssetComponent/>
    );
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

    if (authState instanceof AuthPending) {
        return <LoadingScreenComponent/>
    } else {
        if (authState.user != null) {
            return <RootContainerComponent/>
        } else return <Redirect to="/auth"/>
    }
}
export default RootComponent