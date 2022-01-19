import { Request } from "./Request";

export enum ActionType {
  CREATE = "create",
  UPDATE = "update",
  DISMISS = "dismiss"
}
type Action = {
  type: ActionType,
  payload?: Request,
}
type State = {
  request?: Request,
  isCreate: boolean,
  isOpen: boolean
}

export const initialState: State = {
  isCreate: false,
  isOpen: false,
  request: undefined,
}

export const reducer = (state: State, action: Action) => {
  const { type, payload } = action;

  switch (type) {
    case ActionType.CREATE:
      return {
        request: undefined,
        isCreate: true,
        isOpen: true,
      }
    case ActionType.UPDATE:
      return {
        request: payload,
        isCreate: false,
        isOpen: true
      }
    case ActionType.DISMISS:
      return {
        request: undefined,
        isOpen: false,
        isCreate: false
      }
    default: return state;
  }
}