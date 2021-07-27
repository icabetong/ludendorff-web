import { generateID } from "../infrastructure/Backend"
import { User, UserCore } from "../user/User"

export class Department {
    departmentId: string
    name?: string
    managerSSN?: UserCore
    count: number = 0

    minimize(): DepartmentCore {
        return DepartmentCore.from(this)
    }

    constructor(departmentId: string = generateID()) {
        this.departmentId = departmentId
    }

    static COLLECTION = "departments"
    static FIELD_DEPARTMENT_ID = "departmentId"
    static FIELD_DEPARTMENT_NAME = "departmentName"
    static FIELD_MANAGER_SNN = "managerSNN"
    static FIELD_MANAGER_ID = Department.FIELD_MANAGER_SNN + '.' + User.FIELD_USER_ID
    static FIELD_COUNT = "count"
}

export class DepartmentCore {
    departmentId: string
    name?: string

    constructor(departmentId: string = generateID()) {
        this.departmentId = departmentId
    }

    static from(department: Department): DepartmentCore {
        let core = new DepartmentCore(department.departmentId)
        core.name = department.name
        return core
    }
}