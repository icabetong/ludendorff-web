import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, Unsubscribe } from 'firebase/auth';
import { doc, onSnapshot } from "firebase/firestore";
import { hasPermission, Permission, User } from "../user/User";
import { userCollection } from "../../shared/const";
import { auth, firestore } from '../../index';

export type AuthState = {
  status: "fetched" | "pending",
  user?: User
}

export const AuthContext = React.createContext<AuthState>({ status: "pending" })

type AuthProviderProps = {
  children: React.ReactNode
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({ status: "pending" });

  useEffect(() => {
    let dataUnsubscribe: Unsubscribe;
    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser != null) {
        dataUnsubscribe = onSnapshot(doc(firestore, userCollection, firebaseUser.uid), (doc) => {
          setAuthState({ status: "fetched", user: doc.data() as User });
        })
      } else {
        await auth.signOut();
        navigate("/login");
      }
    });
    return () => {
      if (dataUnsubscribe)
        dataUnsubscribe();
      authUnsubscribe();
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthState(): AuthState {
  return useContext(AuthContext);
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

  if (status === "fetched" && user !== undefined)
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