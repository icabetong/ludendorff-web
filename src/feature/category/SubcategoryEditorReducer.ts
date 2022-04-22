export enum ActionType {
  CREATE = "create",
  UPDATE = "update",
  DISMISS = "dismiss"
}
type Action = {
  type: ActionType,
  payload?: string
}
type State = {
  subcategory?: string,
  isCreate: boolean,
  isOpen: boolean
}

export const initialState: State = {
  subcategory: "",
  isCreate: true,
  isOpen: false
}

export const reducer = (state: State, action: Action): State => {
  const { type, payload } = action;
  switch(type) {
    case ActionType.CREATE:
      return {
        subcategory: "",
        isCreate: true,
        isOpen: true
      }
    case ActionType.UPDATE:
      return {
        subcategory: payload,
        isCreate: false,
        isOpen: true
      }
    case ActionType.DISMISS:
      return {
        ...state,
        isOpen: false,
        subcategory: undefined
      }
    default: return state;
  }
}