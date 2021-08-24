import { firestore } from "../../index"

import { UserCore } from "../user/User";
import { minimize as minimizeDepartment } from "./Department";

import {
    departmentCollection,
    userCollection,
    department as departmentField
} from "../../shared/const";

export const minimize = (department: Department): DepartmentCore => {
    return {
        departmentId: department.departmentId,
        name: department.name
    }
}

export type Department = {
    departmentId: string,
    name?: string,
    manager?: UserCore,
    count: number
}

export type DepartmentCore = {
    departmentId: string,
    name?: string
}

export class DepartmentRepository {
    static async create(department: Department): Promise<void> {
        let batch = firestore.batch();

        batch.set(firestore.collection(departmentCollection)
            .doc(department.departmentId), department);
    
        if (department.manager !== undefined)
            batch.update(firestore.collection(userCollection)
                .doc(department.manager!.userId), departmentField,
                minimizeDepartment(department))

        return batch.commit()
    }

    static async update(department: Department): Promise<void> {
        let batch = firestore.batch();

        if (department.manager !== undefined)
            batch.update(firestore.collection(userCollection)
                .doc(department.manager!.userId), departmentField,
                minimizeDepartment(department))

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