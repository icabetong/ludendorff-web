
export enum RequestResetActionType {
    INVOKE = "invoke",
    DISMISS = "dismiss",
    CHANGED = "changed"
}

type RequestResetAction = {
    type: RequestResetActionType,
    payload?: string
}
type RequestResetState = {
    email?: string,
    isOpen: boolean
}

export const requestResetInitialState: RequestResetState = {
    email: '',
    isOpen: false
}

export const requestResetReducer = (state: RequestResetState, action: RequestResetAction): RequestResetState => {
    const { type, payload } = action;

    switch(type) {
        case RequestResetActionType.INVOKE:
            return {
                ...state,
                isOpen: true
            }
        case RequestResetActionType.DISMISS:
            return {
                email: undefined,
                isOpen: false
            }
        case RequestResetActionType.CHANGED:
            return {
                ...state,
                email: payload
            }
        default: return state;
    }
}