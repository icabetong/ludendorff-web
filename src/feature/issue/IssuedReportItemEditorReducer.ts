import { IssuedReportItem } from "./IssuedReport";

export enum ActionType {
  CREATE = "create",
  UPDATE = "update",
  DISMISS = "dismiss"
}

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
  item: { stockNumber: "", unitCost: 0, quantityIssued: 0, },
  isCreate: true,
  isOpen: false,
}

export const reducer = (state: State, action: Action) => {
  const { type, payload } = action;

  switch (type) {
    case ActionType.CREATE:
      return {
        ...state,
        isCreate: true,
        isOpen: true,
      }
    case ActionType.UPDATE:
      return {
        item: payload,
        isCreate: false,
        isOpen: true
      }
    case ActionType.DISMISS:
      return {
        ...state,
        isOpen: false,
        item: undefined
      }
    default:
      return state;
  }
}