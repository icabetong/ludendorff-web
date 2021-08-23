import { Category } from "./Category";
import { newId } from "../../shared/utils";

export enum CategoryEditorActionType {
    Changed = "changed",
    Create = "create",
    Update = "update",
    Dismiss = "dismiss"
}
type CategoryEditorAction = {
    type: CategoryEditorActionType,
    value?: Category,
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
    const { type, value } = action;
    switch(type) {
        case CategoryEditorActionType.Changed: 
            return {
                ...state,
                category: value
            }
        case CategoryEditorActionType.Create: 
            return {
                category: value,
                isCreate: true,
                isOpen: true,
            }
        case CategoryEditorActionType.Update:
            return {
                category: value,
                isCreate: false,
                isOpen: true,
            }
        case CategoryEditorActionType.Dismiss: 
            return {
                ...state,
                isOpen: false,
                category: undefined
            }
        default: return state;
    }
}
