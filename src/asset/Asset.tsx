import { Category, CategoryCore } from '../category/Category';
import { generateID } from '../infrastructure/Backend';

export class Asset {
    assetId: string
    assetName?: string
    dateCreated?: number
    status?: Status
    category?: CategoryCore
    specifications?: Map<String, String>

    constructor(id = generateID()) {
        this.assetId = id
    }

    static COLLECTION = "assets"
    static FIELD_ASSET_ID = "assetId"
    static FIELD_ASSET_NAME = "assetName"
    static FIELD_DATE_CREATED = "dateCreated"
    static FIELD_STATUS = "status"
    static FIELD_CATEGORY = "category"
    static FIELD_CATEGORY_ID = Asset.FIELD_CATEGORY + '.' + Category.FIELD_CATEGORY_ID
    static FIELD_SPECIFICATION = "specifications"
}

export class AssetCore {
    assetId: string
    assetName?: string
    status?: Status
    category?: CategoryCore

    constructor(id = generateID()) {
        this.assetId = id
    }

    static from(asset: Asset): AssetCore {
        let core = new AssetCore(asset.assetId)
        core.assetName = asset.assetName
        core.status = asset.status
        core.category = asset.category
        return core
    }
}

export enum Status {
    OPERATIONAL,
    IDLE,
    UNDER_MAINTENANCE,
    RETIRED
}