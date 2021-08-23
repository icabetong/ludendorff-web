import { User } from "./User";
import { newId } from "../../shared/utils";

export enum UserEditorActionType {
    CHANGED = "changed",
    CREATE = "create",
    UPDATE = "update",
    DISMISS = "dismiss"
}
type UserEditorAction = {
    type: UserEditorActionType,
    payload?: User
}
type UserEditorState = {
    user?: User,
    isCreate: boolean,
    isOpen: boolean
}

export const userEditorInitialState: UserEditorState = {
    user: { userId: newId(), permissions: 0 },
    isCreate: true,
    isOpen: false
}

export const userEditorReducer = (state: UserEditorState, action: UserEditorAction): UserEditorState => {
    const { type, payload } = action;

    switch(type) {
        case UserEditorActionType.CHANGED:
            return {
                ...state,
                user: payload
            }
        case UserEditorActionType.CREATE:
            return {
                user: payload,
                isCreate: true,
                isOpen: true
            }
        case UserEditorActionType.UPDATE:
            return {
                user: payload,
                isCreate: true,
                isOpen: true
            }
        case UserEditorActionType.DISMISS: 
            return {
                ...state,
                isOpen: false,
                user: undefined
            }
        default: return state;
    }
}