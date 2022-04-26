import { StockCardEntry } from "./StockCard";
import { newId } from "../../shared/utils";

export enum ActionType {
  CREATE = "create",
  UPDATE = "update",
  DISMISS = "dismiss"
}

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
    case ActionType.CREATE:
      return {
        entry: undefined,
        isCreate: true,
        isOpen: true,
      }
    case ActionType.UPDATE:
      return {
        entry: payload,
        isCreate: false,
        isOpen: true,
      }
    case ActionType.DISMISS:
      return {
        ...state,
        isOpen: false,
        entry: undefined,
      }
    default:
      return state;
  }
}