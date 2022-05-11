import { IssuedReportItem } from "./IssuedReport";
import ActionType from "../shared/types/ActionType";
import { newId } from "../../shared/utils";

type Action = {
  type: ActionType,
  payload?: IssuedReportItem
}
type State = {
  item?: IssuedReportItem,
  isCreate: boolean,
  isOpen: boolean,
}
export const initialState: State = {
  item: { issuedReportItemId: newId(), stockNumber: "", unitCost: 0, quantityIssued: 0, },
  isCreate: true,
  isOpen: false,
}

export const reducer = (state: State, action: Action) => {
  const { type, payload } = action;

  switch (type) {
    case "create":
      return {
        item: undefined,
        isCreate: true,
        isOpen: true,
      }
    case "update":
      return {
        item: payload,
        isCreate: false,
        isOpen: true
      }
    case "dismiss":
      return {
        ...state,
        isOpen: false,
        item: undefined
      }
    default:
      return state;
  }
}