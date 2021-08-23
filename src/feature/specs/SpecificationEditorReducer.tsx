export enum SpecificationEditorActionType {
    Changed = "changed",
    Create = "create",
    Update = "update",
    Dismiss = "dismiss"
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
        case SpecificationEditorActionType.Changed: 
            return {
                ...state,
                specification: payload
            }
        case SpecificationEditorActionType.Create:
            return {
                specification: payload,
                isCreate: true,
                isOpen: true
            }
        case SpecificationEditorActionType.Update:
            return {
                specification: payload,
                isCreate: false,
                isOpen: true
            }
        case SpecificationEditorActionType.Dismiss:
            return {
                ...state,
                isOpen: false,
                specification: ['', '']
            }
        default: return state;
    }
}