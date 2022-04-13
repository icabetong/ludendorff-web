import { User } from "./User";
import { newId } from "../../shared/utils";

export enum ActionType {
  CREATE = "create",
  UPDATE = "update",
  DISMISS = "dismiss"
}

type Action = {
  type: ActionType,
  payload?: User
}
type State = {
  user?: User,
  isCreate: boolean,
  isOpen: boolean
}

export const initialState: State = {
  user: { userId: newId(), permissions: [], disabled: false, setupCompleted: false },
  isCreate: true,
  isOpen: false
}

export const reducer = (state: State, action: Action): State => {
  const { type, payload } = action;

  switch (type) {
    case ActionType.CREATE:
      return {
        ...state,
        isCreate: true,
        isOpen: true
      }
    case ActionType.UPDATE:
      return {
        user: payload,
        isCreate: false,
        isOpen: true
      }
    case ActionType.DISMISS:
      return {
        ...state,
        isOpen: false,
        user: undefined
      }
    default:
      return state;
  }
}