import { Category } from "./Category";
import { newId } from "../../shared/utils";

export enum ActionType {
  CHANGED = "changed",
  CREATE = "create",
  UPDATE = "update",
  DISMISS = "dismiss"
}
type Action = {
  type: ActionType,
  payload?: Category,
}
type State = {
  category?: Category,
  isCreate: boolean,
  isOpen: boolean
}
export const initialState: State = {
  category: { categoryId: newId(), count: 0 },
  isCreate: true,
  isOpen: false,
}

export const reducer = (state: State, action: Action) => {
  const { type, payload } = action;

  switch (type) {
    case ActionType.CREATE:
      return {
        category: undefined,
        isCreate: true,
        isOpen: true,
      }
    case ActionType.UPDATE:
      return {
        category: payload,
        isCreate: false,
        isOpen: true,
      }
    case ActionType.DISMISS:
      return {
        ...state,
        isOpen: false,
        category: undefined
      }
    default: return state;
  }
}
