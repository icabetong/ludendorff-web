import { Category } from "./Category";
import { newId } from "../../shared/utils";

export enum CategoryEditorActionType {
    CHANGED = "changed",
    CREATE = "create",
    UPDATE = "update",
    DISMISS = "dismiss"
}
type CategoryEditorAction = {
    type: CategoryEditorActionType,
    payload?: Category,
}
type CategoryEditorState = {
    category?: Category,
    isCreate: boolean,
    isOpen: boolean
}
export const categoryEditorInitialState: CategoryEditorState = {
    category: { categoryId: newId(), count: 0 },
    isCreate: true,
    isOpen: false,
}

export const categoryEditorReducer = (state: CategoryEditorState, action: CategoryEditorAction) => {
    const { type, payload } = action;
    switch(type) {
        case CategoryEditorActionType.CHANGED: 
            return {
                ...state,
                category: payload
            }
        case CategoryEditorActionType.CREATE: 
            return {
                category: undefined,
                isCreate: true,
                isOpen: true,
            }
        case CategoryEditorActionType.UPDATE:
            return {
                category: payload,
                isCreate: false,
                isOpen: true,
            }
        case CategoryEditorActionType.DISMISS: 
            return {
                ...state,
                isOpen: false,
                category: undefined
            }
        default: return state;
    }
}
