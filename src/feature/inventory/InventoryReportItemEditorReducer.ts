import { InventoryReportItem } from "./InventoryReport";

export enum ActionType {
  CREATE = "create",
  UPDATE = "update",
  DISMISS = "dismiss"
}

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

  switch(type) {
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