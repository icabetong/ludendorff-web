import React, { useEffect, useState } from 'react';

import history from "../navigation/History";
import { User } from "../user/User";
import { userCollection } from "../../shared/const";
import { auth, firestore } from "../../index";

export class AuthFetched {
    user: User | null;

    constructor(user: User | null) {
        this.user = user;
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
            if (firebaseUser != null) {
                firestore.collection(userCollection)
                    .doc(firebaseUser.uid)
                    .onSnapshot((document) => {
                        setAuthState(new AuthFetched(document.data() as User));
                        history.push("/");
                    });
            } else {
                auth.signOut();
                history.push("/auth");
            }
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    );
}

