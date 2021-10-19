import { User } from "./User";
import { newId } from "../../shared/utils";

export enum ActionType {
    CREATE = "create",
    UPDATE = "update",
    DISMISS = "dismiss"
}
type UserEditorAction = {
    type: ActionType,
    payload?: User
}
type UserEditorState = {
    user?: User,
    isCreate: boolean,
    isOpen: boolean
}

export const initialState: UserEditorState = {
    user: { userId: newId(), permissions: [], disabled: false },
    isCreate: true,
    isOpen: false
}

export const reducer = (state: UserEditorState, action: UserEditorAction): UserEditorState => {
    const { type, payload } = action;

    switch(type) {
        case ActionType.CREATE:
            return {
                user: undefined,
                isCreate: true,
                isOpen: true
            }
        case ActionType.UPDATE:
            return {
                user: payload,
                isCreate: true,
                isOpen: true
            }
        case ActionType.DISMISS: 
            return {
                ...state,
                isOpen: false,
                user: undefined
            }
        default: return state;
    }
}