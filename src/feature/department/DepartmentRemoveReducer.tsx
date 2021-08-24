import { Department } from "./Department";

export enum DepartmentRemoveActionType {
    REQUEST = "request",
    DISMISS = "dismiss"
}

type DepartmentRemoveAction = {
    type: DepartmentRemoveActionType,
    payload?: Department
}
type DepartmentRemoveState = {
    isRequest: boolean,
    department?: Department
}

export const departmentRemoveInitialState: DepartmentRemoveState = {
    isRequest: false
}

export const departmentRemoveReducer = (state: DepartmentRemoveState, action: DepartmentRemoveAction) => {
    const { type, payload } = action;

    switch(type) {
        case DepartmentRemoveActionType.REQUEST: 
            return {
                isRequest: true,
                department: payload
            }
        case DepartmentRemoveActionType.DISMISS:
            return {
                isRequest: false,
                department: undefined
            }
        default: return state;
    }
}