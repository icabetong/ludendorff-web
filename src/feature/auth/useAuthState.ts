import { useContext } from "react";
import { AuthContext, AuthState } from "../auth/AuthProvider";

function useAuthState(): AuthState {
    const authState = useContext(AuthContext);
    return authState;
}

export default useAuthState;