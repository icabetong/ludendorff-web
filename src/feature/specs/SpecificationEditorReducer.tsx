export enum ActionType {
    CREATE = "create",
    UPDATE = "update",
    DISMISS = "dismiss"
}
type Action = {
    type: ActionType,
    payload?: [string, string]
}
type State = {
    specification?: [string, string],
    isCreate: boolean,
    isOpen: boolean
}

export const initialState: State = {
    specification: ['', ''],
    isCreate: true,
    isOpen: false
}

export const reducer = (state: State, action: Action): State => {
    const { type, payload } = action;
    switch(type) {
        case ActionType.CREATE:
            return {
                specification: undefined,
                isCreate: true,
                isOpen: true
            }
        case ActionType.UPDATE:
            return {
                specification: payload,
                isCreate: false,
                isOpen: true
            }
        case ActionType.DISMISS:
            return {
                ...state,
                isOpen: false,
                specification: ['', '']
            }
        default: return state;
    }
}