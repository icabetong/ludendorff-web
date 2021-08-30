import { Assignment } from "./Assignment";
import { newId } from "../../shared/utils";

export enum AssignmentEditorActionType {
    CHANGED = "changed",
    CREATE = "create",
    UPDATE = "update",
    DISMISS = "dismiss"
}

type AssignmentEditorAction = {
    type: AssignmentEditorActionType,
    payload?: Assignment
}
type AssignmentEditorState = {
    assignment?: Assignment,
    isCreate: boolean,
    isOpen: boolean
}

export const assignmentEditorInitialState: AssignmentEditorState = {
    assignment: { assignmentId: newId() },
    isCreate: true,
    isOpen: false
}

export const assignmentEditorReducer = (state: AssignmentEditorState, action: AssignmentEditorAction): AssignmentEditorState => {
    const { type, payload } = action;

    switch(type) {
        case AssignmentEditorActionType.CHANGED:
            return {
                ...state,
                assignment: payload
            }
        case AssignmentEditorActionType.CREATE: 
            return {
                ...state,
                isCreate: true,
                isOpen: true
            }
        case AssignmentEditorActionType.UPDATE:
            return {
                assignment: payload,
                isCreate: false,
                isOpen: true
            }
        case AssignmentEditorActionType.DISMISS:
            return {
                ...state,
                isOpen: false,
                assignment: undefined
            }
        default: return state;
    }
}