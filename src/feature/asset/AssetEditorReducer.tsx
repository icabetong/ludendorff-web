import { Asset, Status } from "./Asset";
import { newId } from "../../shared/utils";

export enum AssetEditorActionType {
    CHANGED = "changed",
    CREATE = "create",
    UPDATE = "update",
    DISMISS = "dismiss"
}
type AssetEditorAction = {
    type: AssetEditorActionType,
    payload?: Asset
}
type AssetEditorState = {
    asset?: Asset,
    isCreate: boolean,
    isOpen: boolean
}
export const assetEditorInitialState: AssetEditorState = {
    asset: { assetId: newId(), status: Status.IDLE },
    isCreate: true,
    isOpen: false,
}
export const assetEditorReducer = (state: AssetEditorState, action: AssetEditorAction) => {
    const { type, payload } = action;
    switch(type) {
        case AssetEditorActionType.CHANGED:
            return {
                ...state,
                asset: payload
            }
        case AssetEditorActionType.CREATE:
            return {
                ...state,
                isCreate: true,
                isOpen: true
            }
        case AssetEditorActionType.UPDATE: 
            return {
                asset: payload,
                isCreate: false,
                isOpen: true
            }
        case AssetEditorActionType.DISMISS:
            return {
                ...state,
                isOpen: false,
                asset: undefined
            }
        default: return state;
    }
}