import { firestore } from "../../index"

import { UserCore } from "../user/User";

import {
    departmentCollection
} from "../../shared/const";

export type Department = {
    departmentId: string,
    name?: string,
    managerSNN?: UserCore,
    count: number
}

export type DepartmentCore = {
    departmentId: string,
    name?: string
}

export class DepartmentRepository {
    static async create(department: Department): Promise<void> {
        return await firestore.collection(departmentCollection)
            .doc(department.departmentId)
            .set(department)
    }

    static async update(department: Department): Promise<void> {
        return await firestore.collection(departmentCollection)
            .doc(department.departmentId)
            .set(department)
    }

    static async remove(department: Department): Promise<void> {
        return await firestore.collection(departmentCollection)
            .doc(department.departmentId)
            .delete()
    }
}