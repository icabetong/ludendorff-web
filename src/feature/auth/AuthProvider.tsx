import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import { auth } from '../../index';

export const AuthContext = React.createContext<firebase.User | null>(null);

export const AuthProvider: React.FC = ({ children }) => {
    const [user, setUser] = useState<firebase.User | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={ user }>
            {children}
        </AuthContext.Provider>
    );
}

