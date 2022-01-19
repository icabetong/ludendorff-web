import { Assignment } from "./Assignment";
import { newId } from "../../shared/utils";

export enum ActionType {
  CREATE = "create",
  UPDATE = "update",
  DISMISS = "dismiss"
}

type Action = {
  type: ActionType,
  payload?: Assignment
}
type State = {
  assignment?: Assignment,
  isCreate: boolean,
  isOpen: boolean
}

export const initialState: State = {
  assignment: { assignmentId: newId() },
  isCreate: true,
  isOpen: false
}

export const reducer = (state: State, action: Action): State => {
  const { type, payload } = action;

  switch (type) {
    case ActionType.CREATE:
      return {
        assignment: undefined,
        isCreate: true,
        isOpen: true
      }
    case ActionType.UPDATE:
      return {
        assignment: payload,
        isCreate: false,
        isOpen: true
      }
    case ActionType.DISMISS:
      return {
        ...state,
        isOpen: false,
        assignment: undefined
      }
    default: return state;
  }
}