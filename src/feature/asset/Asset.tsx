import firebase from "firebase/app";
import { firestore } from "../../index";
import { DocumentSnapshot, Timestamp } from "@firebase/firestore-types";

import { Category, CategoryCore } from '../category/Category';
import { newId } from "../../shared/utils";

const FieldValue = firebase.firestore.FieldValue;

export class Asset {
    assetId: string
    assetName?: string
    dateCreated?: Timestamp
    status?: Status
    category?: CategoryCore
    specifications?: Map<string, string>

    constructor(id = newId()) {
        this.assetId = id
    }

    minimize(): AssetCore {
        return AssetCore.from(this)
    }

    formatDate(): string {
        const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' } as const;
        return this.dateCreated !== undefined ? this.dateCreated?.toDate().toLocaleDateString(['en-PH'], options) : "unknown" ;
    }

    getLocalizedCategory(): string {
        return this.category?.categoryName !== undefined ? this.category?.categoryName : "unknown"
    }

    getLocalizedStatus(): string {
        return getStatusLoc(this.status)
    }

    static from(document: any): Asset {
        let asset = new Asset(document.assetId)
        asset.assetName = document.assetName
        asset.dateCreated = document.dateCreated
        asset.category = document.category
        asset.status = document.status
        asset.specifications = document.specifications
        return asset
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

    constructor(id = newId()) {
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
    OPERATIONAL = "OPERATIONAL",
    IDLE = "IDLE",
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE",
    RETIRED = "RETIRED"
}

export const getStatusLoc = (status: Status | undefined): string => {
    switch(status) {
        case Status.OPERATIONAL:
            return "status_operational"
        case Status.IDLE:
            return "status_idle";
        case Status.UNDER_MAINTENANCE:
            return "status_under_maintenance"
        case Status.RETIRED:
            return "status_retired"
        default:
            return "unknown"
    }
}

export class AssetRepository {

    static async create(asset: Asset): Promise<void> {
        let batch = firestore.batch();

        batch.set(firestore.collection(Asset.COLLECTION).doc(asset.assetId), asset);

        batch.update(firestore.collection(Category.COLLECTION)
            .doc(asset.category?.categoryId), Category.FIELD_COUNT, FieldValue.increment(1))

        return await batch.commit()
    }

    static async update(asset: Asset, previousCategoryId?: string): Promise<void> {
        let batch = firestore.batch()
        batch.set(firestore.collection(Asset.COLLECTION)
            .doc(asset.assetId), asset)
        batch.update(firestore.collection(Category.COLLECTION)
            .doc(asset.category?.categoryId), FieldValue.increment(1))
        batch.update(firestore.collection(Category.COLLECTION)
            .doc(previousCategoryId), FieldValue.increment(-1))

        return batch.commit()
    }

    static async remove(asset: Asset): Promise<void> {
        let batch = firestore.batch()
        batch.delete(firestore.collection(Asset.COLLECTION)
            .doc(asset.assetId))
        batch.update(firestore.collection(Category.COLLECTION)
            .doc(asset.category?.categoryId), FieldValue.increment(-1))

        return batch.commit()
    }

    static async fetch(snapshot?: DocumentSnapshot): Promise<DocumentSnapshot[]> {
        let query = firestore.collection(Asset.COLLECTION)
            .orderBy(Asset.FIELD_ASSET_NAME, "asc")
            .limit(1)          

        if (snapshot) query = query.startAfter(snapshot)

        let task = await query.get()
        return task.docs;
    }
}

