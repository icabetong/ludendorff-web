import { User } from "./User";

export enum UserRemoveActionType {
    REQUEST = "request",
    DISMISS = "dismiss"
}

type UserRemoveAction = {
    type: UserRemoveActionType,
    payload?: User
}
type UserRemoveState = {
    isRequest: boolean,
    user?: User
}

export const userRemoveInitialState: UserRemoveState = {
    isRequest: false
}

export const userRemoveReducer = (state: UserRemoveState, action: UserRemoveAction): UserRemoveState => {
    const { type, payload } = action;

    switch(type) {
        case UserRemoveActionType.REQUEST: 
            return {
                isRequest: true,
                user: payload
            }
        case UserRemoveActionType.DISMISS:
            return {
                isRequest: false,
                user: undefined
            }
        default: return state;
    }
}