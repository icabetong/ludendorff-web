import { Asset } from "./Asset";

export enum AssetRemoveActionType {
    REQUEST = "request",
    DISMISS = "dismiss"
}

type AssetRemoveAction = {
    type: AssetRemoveActionType,
    payload?: Asset
}
type AssetRemoveState = {
    isRequest: boolean,
    asset?: Asset
}

export const assetRemoveInitialState: AssetRemoveState = {
    isRequest: false,
}

export const assetRemoveReducer = (state: AssetRemoveState, action: AssetRemoveAction): AssetRemoveState => {
    const { type, payload } = action;

    switch(type) {
        case AssetRemoveActionType.REQUEST:
            return {
                isRequest: true,
                asset: payload
            }
        case AssetRemoveActionType.DISMISS:
            return {
                isRequest: false,
                asset: undefined,
            }
        default: return state;
    }
}