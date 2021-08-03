import { useContext } from "react"
import { Redirect } from "react-router"

import { AuthContext, AuthFetched, AuthPending } from "../auth/AuthProvider"
import "./Root.scss";

const RootContainerComponent = () => {
    return(
        <div></div>
    );
}

const RootComponent = () => {
    const authState = useContext(AuthContext);

    if (authState instanceof AuthPending) {
        return <div>Loading</div>
    } else if (authState instanceof AuthFetched) {
        if (authState.user != null) {
            return <RootContainerComponent/>
        } else return <Redirect to="/auth"/>
    } else return <Redirect to="/auth"/>
}
export default RootComponent