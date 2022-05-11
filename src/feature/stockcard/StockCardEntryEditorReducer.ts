import { StockCardEntry } from "./StockCard";
import ActionType from "../shared/types/ActionType";
import { newId } from "../../shared/utils";

type Action = {
  type: ActionType,
  payload?: StockCardEntry
}
type State = {
  entry?: StockCardEntry,
  isCreate: boolean,
  isOpen: boolean,
}
export const initialState: State = {
  entry: {
    stockCardEntryId: newId(),
    receivedQuantity: 0,
    requestedQuantity: 0,
    issueQuantity: 0,
  },
  isCreate: true,
  isOpen: false,
}
export const reducer = (state: State, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case "create":
      return {
        entry: undefined,
        isCreate: true,
        isOpen: true,
      }
    case "update":
      return {
        entry: payload,
        isCreate: false,
        isOpen: true,
      }
    case "dismiss":
      return {
        ...state,
        isOpen: false,
        entry: undefined,
      }
    default:
      return state;
  }
}