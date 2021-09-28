import axios, { AxiosResponse } from "axios";
import { auth, firestore } from "../../index";

import { Department, DepartmentCore } from "../department/Department";

import {
    userCollection,
    departmentCollection,
    assignmentCollection,
    departmentManagerId,
    departmentManager,
    assignmentUser,
    assignmentUserId
} from "../../shared/const";

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
        user.permissions.includes(permission) ;
}

export const minimize = (user: User): UserCore => {
    return {
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        imageUrl: user.imageUrl,
        position: user.position,
        deviceToken: user.deviceToken
    }
}

export type User = {
    userId: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    imageUrl?: string,
    permissions: number[],
    position?: string,
    department?: DepartmentCore,
    deviceToken?: string,
    disabled: boolean
}

export type UserCore = {
    userId: string,
    name?: string,
    email?: string,
    imageUrl?: string,
    position?: string,
    deviceToken?: string
}

const SERVER_URL = "https://deshi-production.up.railway.app";
export class UserRepository {

    static async create(user: User): Promise<AxiosResponse<any>> {
        let idToken = await auth.currentUser?.getIdToken(false);

        return await axios.post(`${SERVER_URL}/create-user`, {
            token: idToken,
            ...user
        });
    }

    static async update(user: User): Promise<void> {
        let batch = firestore.batch();
        batch.set(firestore.collection(userCollection).doc(user.userId),
            user);

        if (user.department !== undefined) {
            let docs = await firestore.collection(departmentCollection)
                .where(departmentManagerId, "==", user.userId)
                .get();

            docs.forEach((doc) => {
                let department = doc.data() as Department;
                if (department.departmentId !== user.department?.departmentId)
                    batch.update(doc.ref, departmentManager, null);
            })
        }

        let docs = await firestore.collection(assignmentCollection)
                .where(assignmentUserId, "==", user.userId)
                .get()
        docs.forEach((doc) => {
            batch.update(doc.ref, assignmentUser, minimize(user))
        })

        await batch.commit()
    }

    static async modify(userId: string, status: boolean): Promise<AxiosResponse<any>> {
        let idToken = await auth.currentUser?.getIdToken(false);

        return await axios.patch(`${SERVER_URL}/modify-user`, {
            token: idToken,
            userId: userId,
            disabled: status
        })
    }

    static async remove(user: User): Promise<AxiosResponse<any>> {
        let idToken = await auth.currentUser?.getIdToken(false);

        return await axios.delete(`${SERVER_URL}/remove-user`, {
            data: {
                token: idToken,
                userId: user.userId
            }
        })
    }
}