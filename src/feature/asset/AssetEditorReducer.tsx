import { Asset } from "./Asset";
import { newId } from "../../shared/utils";

export enum AssetEditorActionType {
    Changed = "changed",
    Create = "create",
    Update = "update",
    Dismiss = "dismiss"
}
type AssetEditorAction = {
    type: AssetEditorActionType,
    value?: Asset
}
type AssetEditorState = {
    asset?: Asset,
    isCreate: boolean,
    isOpen: boolean
}
export const assetEditorInitialState: AssetEditorState = {
    asset: { assetId: newId() },
    isCreate: true,
    isOpen: false,
}
export const assetEditorReducer = (state: AssetEditorState, action: AssetEditorAction) => {
    const { type, value } = action;
    switch(type) {
        case AssetEditorActionType.Changed:
            return {
                ...state,
                asset: value
            }
        case AssetEditorActionType.Create:
            return {
                asset: value,
                isCreate: true,
                isOpen: true
            }
        case AssetEditorActionType.Update: 
            return {
                asset: value,
                isCreate: false,
                isOpen: true
            }
        case AssetEditorActionType.Dismiss:
            return {
                ...state,
                isOpen: false,
                asset: undefined
            }
        default: return state;
    }
}