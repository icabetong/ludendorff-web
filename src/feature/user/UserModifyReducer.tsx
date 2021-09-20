import { User } from "./User";

export enum UserModifyActionType {
    REQUEST = "request",
    DISMISS = "dismiss"
}

type UserModifyAction = {
    type: UserModifyActionType,
    payload?: User
}
type UserModifyState = {
    isRequest: boolean,
    user?: User
}

export const userModifyInitialState: UserModifyState = {
    isRequest: false,
}

export const userModifyReducer = (state: UserModifyState, action: UserModifyAction): UserModifyState => {
    const { type, payload } = action;

    switch(type) {
        case UserModifyActionType.REQUEST:
            return {
                isRequest: true,
                user: payload
            }
        case UserModifyActionType.DISMISS:
            return {
                isRequest: false,
                user: undefined
            }
        default: return state;
    }
}