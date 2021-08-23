export enum SpecificationEditorActionType {
    CHANGED = "changed",
    CREATE = "create",
    UPDATE = "update",
    DISMISS = "dismiss"
}
type SpecificationEditorAction = {
    type: SpecificationEditorActionType,
    payload?: [string, string]
}
type SpecificationEditorState = {
    specification?: [string, string],
    isCreate: boolean,
    isOpen: boolean
}

export const specificationEditorInitialState: SpecificationEditorState = {
    specification: ['', ''],
    isCreate: true,
    isOpen: false
}

export const specificationReducer = (state: SpecificationEditorState, action: SpecificationEditorAction): SpecificationEditorState => {
    const { type, payload } = action;
    switch(type) {
        case SpecificationEditorActionType.CHANGED: 
            return {
                ...state,
                specification: payload
            }
        case SpecificationEditorActionType.CREATE:
            return {
                specification: payload,
                isCreate: true,
                isOpen: true
            }
        case SpecificationEditorActionType.UPDATE:
            return {
                specification: payload,
                isCreate: false,
                isOpen: true
            }
        case SpecificationEditorActionType.DISMISS:
            return {
                ...state,
                isOpen: false,
                specification: ['', '']
            }
        default: return state;
    }
}