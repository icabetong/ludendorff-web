import React, { useEffect, useState } from 'react';

import history from "../navigation/History";
import { User } from "../user/User";
import { userCollection } from "../../shared/const";
import { auth, firestore } from "../../index";

export enum AuthStatus { FETCHED, PENDING }
export type AuthState = {
    status: AuthStatus,
    user?: User
}

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

export const AuthContext = React.createContext<AuthState>({ status: AuthStatus.PENDING })

export const AuthProvider: React.FC = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({ status: AuthStatus.PENDING });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser != null) {
                firestore.collection(userCollection)
                    .doc(firebaseUser.uid)
                    .onSnapshot((document) => {
                        setAuthState({ status: AuthStatus.FETCHED, user: document.data() as User });
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

