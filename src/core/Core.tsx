import { useContext } from "react"
import firebase from "firebase/app";
import { AuthContext } from "../auth/AuthProvider"

const CoreComponent = () => {
    const authContext = useContext(AuthContext);

    const onSignOut = () => {
        firebase.auth().signOut()
    }

    return (
        <div>
            <h1>{authContext?.email}</h1>
            <button onClick={onSignOut}>Sign Out</button>
        </div>

    )
}
export default CoreComponent