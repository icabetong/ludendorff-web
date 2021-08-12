import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';

import { auth } from "../../index"
import history from "../navigation/History";

export class AuthFetched {
    user: firebase.User | null

    constructor(user: firebase.User | null) {
        this.user = user
    }
}
export class AuthPending {
    /**
     *  This class is used for determining 
     *  the state of authentication.
     *  It signifies that the SDK is currently
     *  fetching the necessary data whether
     *  the user is currently signed-in or not 
     */
}

export const AuthContext = React.createContext<AuthFetched | AuthPending>(new AuthPending())

export const AuthProvider: React.FC = ({ children }) => {
    const [authState, setAuthState] = useState<AuthFetched | AuthPending>(new AuthPending());

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            setAuthState(new AuthFetched(firebaseUser));
            if (firebaseUser != null)
                history.push("/");
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    );
}

