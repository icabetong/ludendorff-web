import { StockCard } from "./StockCard";
import ActionType from "../shared/types/ActionType";
import { newId } from "../../shared/utils";

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
    case "create":
      return {
        stockCard: undefined,
        isCreate: true,
        isOpen: true,
      }
    case "update":
      return {
        stockCard: payload,
        isCreate: false,
        isOpen: true,
      }
    case "dismiss":
      return {
        ...state,
        isOpen: false,
        stockCard: undefined
      }
    default:
      return state;
  }
}