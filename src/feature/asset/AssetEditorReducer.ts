import { Asset } from "./Asset";
import ActionType from "../shared/types/ActionType";

type Action = {
  type: ActionType,
  payload?: Asset
}
type State = {
  asset?: Asset,
  isCreate: boolean,
  isOpen: boolean
}
export const initialState: State = {
  asset: { stockNumber: "", unitValue: 0 },
  isCreate: true,
  isOpen: false,
}
export const reducer = (state: State, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case "create":
      return {
        asset: undefined,
        isCreate: true,
        isOpen: true
      }
    case "update":
      return {
        asset: payload,
        isCreate: false,
        isOpen: true
      }
    case "dismiss":
      return {
        ...state,
        isOpen: false,
        asset: undefined
      }
    default:
      return state;
  }
}