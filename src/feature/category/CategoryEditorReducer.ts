import { Category } from "./Category";
import ActionType from "../shared/types/ActionType";
import { newId } from "../../shared/utils";

type Action = {
  type: ActionType,
  payload?: Category,
}
type State = {
  category?: Category,
  isCreate: boolean,
  isOpen: boolean
}
export const initialState: State = {
  category: { categoryId: newId(), subcategories: [], count: 0 },
  isCreate: true,
  isOpen: false,
}

export const reducer = (state: State, action: Action) => {
  const { type, payload } = action;

  switch (type) {
    case "create":
      return {
        category: undefined,
        isCreate: true,
        isOpen: true,
      }
    case "update":
      return {
        category: payload,
        isCreate: false,
        isOpen: true,
      }
    case "dismiss":
      return {
        isCreate: false,
        isOpen: false,
        category: undefined
      }
    default:
      return state;
  }
}
