import { Category } from "./Category";

export enum CategoryRemoveActionType {
    REQUEST = "request",
    DISMISS = "dismiss"
}

type CategoryRemoveAction = {
    type: CategoryRemoveActionType,
    payload?: Category
}
type CategoryRemoveState = {
    isRequest: boolean,
    category?: Category
}
export const categoryRemoveInitialState: CategoryRemoveState = {
    isRequest: false,
}

export const categoryRemoveReducer = (state: CategoryRemoveState, action: CategoryRemoveAction): CategoryRemoveState => {
    const { type, payload } = action;

    switch(type) {
        case CategoryRemoveActionType.REQUEST:
            return {
                isRequest: true,
                category: payload
            }
        case CategoryRemoveActionType.DISMISS:
            return {
                isRequest: false,
                category: undefined
            }
        default: return state;
    }
}