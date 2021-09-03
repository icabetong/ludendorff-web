
export enum RequestResetActionType {
    INVOKE = "invoke",
    DISMISS = "dismiss",
}

type RequestResetAction = {
    type: RequestResetActionType
}
type RequestResetState = {
    isOpen: boolean
}

export const requestResetInitialState: RequestResetState = {
    isOpen: false
}

export const requestResetReducer = (state: RequestResetState, action: RequestResetAction): RequestResetState => {
    const { type } = action;

    switch(type) {
        case RequestResetActionType.INVOKE:
            return {
                ...state,
                isOpen: true
            }
        case RequestResetActionType.DISMISS:
            return {
                isOpen: false
            }
        default: return state;
    }
}