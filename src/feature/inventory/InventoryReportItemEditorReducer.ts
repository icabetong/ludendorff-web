import { InventoryReportItem } from "./InventoryReport";
import ActionType from "../shared/types/ActionType";

type Action = {
  type: ActionType,
  payload?: InventoryReportItem
}
type State = {
  item?: InventoryReportItem,
  isCreate: boolean,
  isOpen: boolean,
}
export const initialState: State = {
  item: { stockNumber: "", unitValue: 0, balancePerCard: 0, onHandCount: 0 },
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
        isOpen: true,
      }
    case "dismiss":
      return {
        ...state,
        isOpen: false,
        item: undefined,
      }
    default:
      return state;
  }
}