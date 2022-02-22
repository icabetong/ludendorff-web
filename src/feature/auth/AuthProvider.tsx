import React, { useEffect, useState, useContext } from 'react';
import { onAuthStateChanged, Unsubscribe } from 'firebase/auth';
import { onSnapshot, doc } from "firebase/firestore";
import history from "../navigation/History";
import { User, hasPermission, Permission } from "../user/User";
import { userCollection } from "../../shared/const";
import { auth, firestore } from '../../index';

export enum AuthStatus { FETCHED, PENDING }
export type AuthState = {
  status: AuthStatus,
  user?: User
}

export const AuthContext = React.createContext<AuthState>({ status: AuthStatus.PENDING })

export const AuthProvider: React.FC = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ status: AuthStatus.PENDING });

  useEffect(() => {
    let dataUnsubscribe: Unsubscribe;
    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser != null) {
        dataUnsubscribe = onSnapshot(doc(firestore, userCollection, firebaseUser.uid), (doc) => {
          setAuthState({ status: AuthStatus.FETCHED, user: doc.data() as User });
        })
      } else {
        auth.signOut();
        history.push("/auth");
      }
    });
    return () => {
      if (dataUnsubscribe)
        dataUnsubscribe();
      authUnsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthState(): AuthState {
  const authState = useContext(AuthContext);
  return authState;
}

type PermissionHook = {
  canRead: boolean,
  canWrite: boolean,
  canDelete: boolean,
  canManageUsers: boolean,
  isAdmin: boolean
}

export function usePermissions(): PermissionHook {
  const { status, user } = useAuthState();

  if (status === AuthStatus.FETCHED && user !== undefined)
    return {
      canRead: hasPermission(user, Permission.READ),
      canWrite: hasPermission(user, Permission.WRITE),
      canDelete: hasPermission(user, Permission.DELETE),
      canManageUsers: hasPermission(user, Permission.MANAGE_USERS),
      isAdmin: hasPermission(user, Permission.ADMINISTRATIVE)
    }
  else
    return {
      canRead: false,
      canWrite: false,
      canDelete: false,
      canManageUsers: false,
      isAdmin: false
    }
}