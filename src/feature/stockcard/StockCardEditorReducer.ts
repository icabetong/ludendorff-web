import { StockCard } from "./StockCard";
import { newId } from "../../shared/utils";

export enum ActionType {
  CREATE = "create",
  UPDATE = "update",
  DISMISS = "dismiss"
}

type Action = {
  type: ActionType,
  payload?: StockCard,
}
type State = {
  stockCard?: StockCard,
  isCreate: boolean,
  isOpen: boolean
}
export const initialState: State = {
  stockCard: { stockCardId: newId(), unitPrice: 0, entries: [], balances: {} },
  isCreate: true,
  isOpen: false,
}
export const reducer = (state: State, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case ActionType.CREATE:
      return {
        stockCard: undefined,
        isCreate: true,
        isOpen: true,
      }
    case ActionType.UPDATE:
      return {
        stockCard: payload,
        isCreate: false,
        isOpen: true,
      }
    case ActionType.DISMISS:
      return {
        ...state,
        isOpen: false,
        stockCard: undefined
      }
    default:
      return state;
  }
}