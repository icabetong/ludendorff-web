import ActionType from "../shared/types/ActionType";

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
    case "create":
      return {
        subcategory: "",
        isCreate: true,
        isOpen: true
      }
    case "update":
      return {
        subcategory: payload,
        isCreate: false,
        isOpen: true
      }
    case "dismiss":
      return {
        ...state,
        isOpen: false,
        subcategory: undefined
      }
    default: return state;
  }
}