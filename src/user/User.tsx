import { Department, DepartmentCore } from "../department/Department";
import { generateID } from "../infrastructure/Backend";

export class User {
    userId: string
    firstName?: string
    lastName?: string
    email?: string
    imageUrl?: string
    permissions: number = 0
    position?: string
    department?: DepartmentCore

    hasPermission(permission: number): Boolean {
        return (this.permissions & permission) === permission
    }

    getDisplayName(): string {
        return this.firstName + ' ' + this.lastName
    }

    constructor(userId: string = generateID()) {
        this.userId = userId
    }

    static COLLECTION = "users"
    static FIELD_USER_ID = "userId"
    static FIELD_FIRST_NAME = "firstName"
    static FIELD_LAST_NAME = "lastName"
    static FIELD_EMAIL = "email"
    static FIELD_PERMISSIONS = "permissions"
    static FIELD_POSITION = "position"
    static FIELD_DEPARTMENT = "department"
    static FIELD_DEPARTMENT_ID = User.FIELD_DEPARTMENT + "." + Department.FIELD_DEPARTMENT_ID

    static PERMISSION_READ = 1
    static PERMISSION_WRITE = 2
    static PERMISSION_DELETE = 4
    static PERMISSION_AUDIT = 8
    static PERMISSION_MANAGE_USERS = 16
    static PERMISSION_ADMINISTRATIVE = 32
}

export class UserCore {
    userId: string
    name?: string
    email?: string
    imageUrl?: string
    position?: string

    constructor(userId: string = generateID()) {
        this.userId = userId
    }
}