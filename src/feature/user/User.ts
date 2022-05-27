import { doc, writeBatch } from "firebase/firestore";
import { httpsCallable, HttpsCallableResult } from "firebase/functions";
import { auth, firestore, functions } from "../../index";
import { userCollection, } from "../../shared/const";

export enum Permission {
  READ = 1,
  WRITE = 2,
  DELETE = 4,
  MANAGE_USERS = 8,
  ADMINISTRATIVE = 16
}

export const hasPermission = (user: User, permission: Permission): boolean => {
  /**
   *  Check if the user has the required permissions,
   *  or has the ability to override the permission systems.
   */
  return user.permissions.includes(Permission.ADMINISTRATIVE) ||
    user.permissions.includes(permission);
}

export type User = {
  userId: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  imageUrl?: string,
  permissions: number[],
  position?: string,
  disabled: boolean,
  setupCompleted: boolean,
}

export class UserRepository {

  static async create(user: User): Promise<HttpsCallableResult> {
    let idToken = await auth.currentUser?.getIdToken(false);
    const { userId, disabled, setupCompleted, ...others } = user;

    const createUser = httpsCallable(functions, 'createUser');
    return await createUser({
      token: idToken,
      ...others,
    });
  }

  static async update(user: User): Promise<void> {
    let batch = writeBatch(firestore);
    batch.set(doc(firestore, userCollection, user.userId),
      user);

    await batch.commit()
  }

  static async modify(userId: string, status: boolean): Promise<HttpsCallableResult> {
    let idToken = await auth.currentUser?.getIdToken(false);

    const modifyUser = httpsCallable(functions, 'modifyUser');
    return await modifyUser({
      token: idToken,
      userId: userId,
      disabled: status,
    });
  }

  static async remove(user: User): Promise<HttpsCallableResult> {
    let idToken = await auth.currentUser?.getIdToken(false);

    const deleteUser = httpsCallable(functions, 'deleteUser');
    return await deleteUser({
      token: idToken,
      userId: user.userId
    })
  }
}