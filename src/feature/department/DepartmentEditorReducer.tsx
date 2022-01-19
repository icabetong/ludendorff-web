import { Department } from "./Department";
import { newId } from "../../shared/utils";

export enum ActionType {
  CREATE = "create",
  UPDATE = "update",
  DISMISS = "dismiss"
}
type Action = {
  type: ActionType,
  payload?: Department
}
type State = {
  department?: Department,
  isCreate: boolean,
  isOpen: boolean
}

export const initialState: State = {
  department: { departmentId: newId(), count: 0 },
  isCreate: true,
  isOpen: false
}

export const reducer = (state: State, action: Action): State => {
  const { type, payload } = action;

  switch (type) {
    case ActionType.CREATE:
      return {
        department: undefined,
        isCreate: true,
        isOpen: true
      }
    case ActionType.UPDATE:
      return {
        department: payload,
        isCreate: false,
        isOpen: true
      }
    case ActionType.DISMISS:
      return {
        ...state,
        isOpen: false,
        department: payload
      }
    default: return state;
  }
}