import { Type } from "./Type";
import { newId } from "../../shared/utils";

export enum ActionType {
  CHANGED = "changed",
  CREATE = "create",
  UPDATE = "update",
  DISMISS = "dismiss"
}
type Action = {
  type: ActionType,
  payload?: Type,
}
type State = {
  type?: Type,
  isCreate: boolean,
  isOpen: boolean
}
export const initialState: State = {
  type: { typeId: newId(), count: 0 },
  isCreate: true,
  isOpen: false,
}

export const reducer = (state: State, action: Action) => {
  const { type, payload } = action;

  switch (type) {
    case ActionType.CREATE:
      return {
        type: undefined,
        isCreate: true,
        isOpen: true,
      }
    case ActionType.UPDATE:
      return {
        type: payload,
        isCreate: false,
        isOpen: true,
      }
    case ActionType.DISMISS:
      return {
        ...state,
        isOpen: false,
        type: undefined
      }
    default: return state;
  }
}
