
export type Credentials = {
    old: string, 
    new: string,
    confirmation: string
}

export enum ChangePasswordActionType {
    INVOKE = "invoke",
    DISMISS = "dismiss",
    CHANGED = "changed"
}

type ChangePasswordAction = {
    type: ChangePasswordActionType,
    payload?: Credentials
}
type ChangePasswordState = {
    credentials?: Credentials,
    isOpen: boolean
}

export const changePasswordInitialState: ChangePasswordState = {
    credentials: { old: '', new: '', confirmation: ''},
    isOpen: false
}

export const changePasswordReducer = (state: ChangePasswordState, action: ChangePasswordAction): ChangePasswordState => {
    const { type, payload } = action;
    
    switch(type) {
        case ChangePasswordActionType.INVOKE:
            return {
                isOpen: true,
            }
        case ChangePasswordActionType.DISMISS:
            return {
                credentials: undefined,
                isOpen: false
            }
        case ChangePasswordActionType.CHANGED:
            return {
                ...state,
                credentials: payload
            }
        default: return state;
    }
}