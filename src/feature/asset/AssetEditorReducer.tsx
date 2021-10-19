import { Asset, Status } from "./Asset";
import { newId } from "../../shared/utils";

export enum ActionType {
    CREATE = "create",
    UPDATE = "update",
    DISMISS = "dismiss"
}
type AssetEditorAction = {
    type: ActionType,
    payload?: Asset
}
type AssetEditorState = {
    asset?: Asset,
    isCreate: boolean,
    isOpen: boolean
}
export const initialState: AssetEditorState = {
    asset: { assetId: newId(), status: Status.IDLE },
    isCreate: true,
    isOpen: false,
}
export const reducer = (state: AssetEditorState, action: AssetEditorAction) => {
    const { type, payload } = action;
    switch(type) {
        case ActionType.CREATE:
            return {
                ...state,
                isCreate: true,
                isOpen: true
            }
        case ActionType.UPDATE: 
            return {
                asset: payload,
                isCreate: false,
                isOpen: true
            }
        case ActionType.DISMISS:
            return {
                ...state,
                isOpen: false,
                asset: undefined
            }
        default: return state;
    }
}