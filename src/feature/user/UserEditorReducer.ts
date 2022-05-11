import { User } from "./User";
import ActionType from "../shared/types/ActionType";
import { newId } from "../../shared/utils";

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
    case "create":
      return {
        ...state,
        isCreate: true,
        isOpen: true
      }
    case "update":
      return {
        user: payload,
        isCreate: false,
        isOpen: true
      }
    case "dismiss":
      return {
        ...state,
        isOpen: false,
        user: undefined
      }
    default:
      return state;
  }
}