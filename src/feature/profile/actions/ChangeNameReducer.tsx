
export enum ChangeNameActionType {
    INVOKE = "invoke",
    DISMISS = "dismiss",
    CHANGED = "changed"
}

type ChangeNameAction = {
    type: ChangeNameActionType,
    payload?: [string, string]
}
type ChangeNameState = {
    name?: [string, string],
    isOpen: boolean
}

export const changeNameInitialState: ChangeNameState = {
    name: ['', ''],
    isOpen: false
}

export const changeNameReducer = (state: ChangeNameState, action: ChangeNameAction): ChangeNameState => {
    const { type, payload } = action;

    switch(type) {
        case ChangeNameActionType.INVOKE:
            return {
                isOpen: true,
            }
        case ChangeNameActionType.DISMISS:
            return {
                name: undefined,
                isOpen: false
            }
        case ChangeNameActionType.CHANGED: 
            return {
                ...state,
                name: payload,
            }
        default: return state;
    }
}