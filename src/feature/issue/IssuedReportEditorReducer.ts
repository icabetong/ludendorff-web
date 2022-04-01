import { IssuedReport } from "./IssuedReport";
import { newId } from "../../shared/utils";

export enum ActionType {
  CREATE = "create",
  UPDATE = "update",
  DISMISS = "dismiss"
}

type Action = {
  type: ActionType,
  payload?: IssuedReport
}
type State = {
  report?: IssuedReport,
  isCreate: boolean,
  isOpen: boolean,
}

export const initialState: State = {
  report: { issuedReportId: newId(), items: [] },
  isCreate: true,
  isOpen: false,
}
export const reducer = (state: State, action: Action) => {
  const { type, payload } = action;
  switch(type) {
    case ActionType.CREATE:
      return {
        ...state,
        isCreate: true,
        isOpen: true,
      }
    case ActionType.UPDATE:
      return {
        report: payload,
        isCreate: false,
        isOpen: true,
      }
    case ActionType.DISMISS:
      return {
        ...state,
        isOpen: false,
        report: undefined
      }
    default:
      return state;
  }
}