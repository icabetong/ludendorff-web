import { useContext } from "react"
import { Redirect } from "react-router"

import { AuthContext, AuthFetched, AuthPending } from "../auth/AuthProvider"
import "./Core.scss";

const CoreInnerComponent = () => {
    return(
        <div></div>
    );
}

const CoreComponent = () => {
    const authState = useContext(AuthContext);

    if (authState instanceof AuthPending) {
        return <div>Loading</div>
    } else if (authState instanceof AuthFetched) {
        if (authState.user != null) {
            return <CoreInnerComponent/>
        } else return <Redirect to="/auth"/>
    } else return <Redirect to="/auth"/>
}
export default CoreComponent