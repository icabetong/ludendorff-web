import { Department } from "./Department";
import { newId } from "../../shared/utils";

export enum DepartmentEditorActionType {
    CHANGED = "changed",
    CREATE = "create",
    UPDATE = "update",
    DISMISS = "dismiss"
}
type DepartmentEditorAction = {
    type: DepartmentEditorActionType,
    payload?: Department
}
type DepartmentEditorState = {
    department?: Department,
    isCreate: boolean,
    isOpen: boolean
}

export const departmentEditorInitialState: DepartmentEditorState = {
    department: { departmentId: newId(), count: 0 },
    isCreate: true,
    isOpen: false
}

export const departmentEditorReducer = (state: DepartmentEditorState, action: DepartmentEditorAction): DepartmentEditorState => {
    const { type, payload } = action;

    switch(type) {
        case DepartmentEditorActionType.CHANGED: 
            return {
                ...state,
                department: payload
            }
        case DepartmentEditorActionType.CREATE:
            return {
                department: undefined,
                isCreate: true,
                isOpen: true
            }
        case DepartmentEditorActionType.UPDATE:
            return {
                department: payload,
                isCreate: true,
                isOpen: true
            }
        case DepartmentEditorActionType.DISMISS:
            return {
                ...state,
                isOpen: false,
                department: payload
            }
        default: return state;
    }
}