import { IssuedReport } from "./IssuedReport";
import ActionType from "../shared/types/ActionType";
import { newId } from "../../shared/utils";

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
  report: { issuedReportId: newId(), issuedItems: [] },
  isCreate: true,
  isOpen: false,
}
export const reducer = (state: State, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case "create":
      return {
        ...state,
        isCreate: true,
        isOpen: true,
      }
    case "update":
      return {
        report: payload,
        isCreate: false,
        isOpen: true,
      }
    case "dismiss":
      return {
        ...state,
        isOpen: false,
        report: undefined
      }
    default:
      return state;
  }
}