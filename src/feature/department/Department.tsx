import { firestore } from "../../index"

import { UserCore } from "../user/User";
import { newId } from "../../shared/IdUtils";

export class Department {
    departmentId: string
    name?: string
    managerSSN?: UserCore
    count: number = 0

    constructor(departmentId: string = newId()) {
        this.departmentId = departmentId
    }

    minimize(): DepartmentCore {
        return DepartmentCore.from(this)
    }

    static from(document: any): Department {
        let department = new Department(document.departmentId)
        department.name = document.name
        department.managerSSN = document.managerSSN
        department.count = document.count

        return department
    }

    static COLLECTION = "departments"
    static FIELD_DEPARTMENT_ID = "departmentId"
    static FIELD_DEPARTMENT_NAME = "departmentName"
    static FIELD_MANAGER_SNN = "managerSNN"
    static FIELD_MANAGER_ID = Department.FIELD_MANAGER_SNN + ".userId"
    static FIELD_COUNT = "count"
}

export class DepartmentCore {
    departmentId: string
    name?: string

    constructor(departmentId: string = newId()) {
        this.departmentId = departmentId
    }

    static from(department: Department): DepartmentCore {
        let core = new DepartmentCore(department.departmentId)
        core.name = department.name
        return core
    }
}

export class DepartmentRepository {
    static async create(department: Department): Promise<void> {
        return await firestore.collection(Department.COLLECTION)
            .doc(department.departmentId)
            .set(department)
    }

    static async update(department: Department): Promise<void> {
        return await firestore.collection(Department.COLLECTION)
            .doc(department.departmentId)
            .set(department)
    }

    static async remove(department: Department): Promise<void> {
        return await firestore.collection(Department.COLLECTION)
            .doc(department.departmentId)
            .delete()
    }

    static async fetch(): Promise<Department[]> {
        let departments: Department[] = [];

        let task = await firestore.collection(Department.COLLECTION).get()
        task.docs.forEach((document) => {
            departments.push(Department.from(document.data()))
        })

        return departments
    }
}