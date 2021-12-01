import firebase from "firebase/app";
import { firestore } from "../../index";
import { Timestamp } from "@firebase/firestore-types";

import { CategoryCore } from '../category/Category';
import { Specification } from "../specs/Specification";
import { 
    assetCollection, 
    categoryCollection,
    categoryCount 
} from "../../shared/const";

const FieldValue = firebase.firestore.FieldValue;

export type Asset = {
    assetId: string,
    assetName?: string,
    dateCreated?: Timestamp,
    status?: Status,
    category?: CategoryCore,
    specifications?: Specification,
}

export type AssetCore = {
    assetId: string,
    assetName?: string,
    status?: Status,
    category?: CategoryCore
}

export const minimize = (asset: Asset): AssetCore => {
    let core: AssetCore = {
        assetId: asset.assetId,
        assetName: asset.assetName,
        status: asset.status,
        category: asset.category
    };
    return core;
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
            return "status.operational"
        case Status.IDLE:
            return "status.idle";
        case Status.UNDER_MAINTENANCE:
            return "status.under_maintenance"
        case Status.RETIRED:
            return "status.retired"
        default:
            return "unknown"
    }
}

export class AssetRepository {

    static async createFromList(assets: Asset[]): Promise<void> {
        if (assets.length < 0) {
            return;
        }

        let batch = firestore.batch();
        assets.forEach((asset) => {
            batch.set(firestore.collection(assetCollection)
            .doc(asset.assetId), asset);
        })

        batch.update(firestore.collection(categoryCollection)
            .doc(assets[0].category?.categoryId), categoryCount, 
                FieldValue.increment(assets.length))
    
        return await batch.commit();
    }

    static async create(asset: Asset): Promise<void> {
        let batch = firestore.batch();

        batch.set(firestore.collection(assetCollection)
            .doc(asset.assetId), asset);

        batch.update(firestore.collection(categoryCollection)
            .doc(asset.category?.categoryId), categoryCount, FieldValue.increment(1))

        return await batch.commit()
    }

    static async update(asset: Asset, previousCategoryId?: string): Promise<void> {
        let batch = firestore.batch()
        batch.set(firestore.collection(assetCollection)
            .doc(asset.assetId), asset)
        
        if (previousCategoryId !== undefined && asset.category?.categoryId !== previousCategoryId) {
            batch.update(firestore.collection(categoryCollection)
                .doc(asset.category?.categoryId), FieldValue.increment(1))

            batch.update(firestore.collection(categoryCollection)
                .doc(previousCategoryId), categoryCount,
                FieldValue.increment(-1))
        }

        return batch.commit()
    }

    static async remove(asset: Asset): Promise<void> {
        let batch = firestore.batch()
        batch.delete(firestore.collection(assetCollection)
            .doc(asset.assetId))
        batch.update(firestore.collection(categoryCollection)
            .doc(asset.category?.categoryId), categoryCount, 
                FieldValue.increment(-1))

        return batch.commit()
    }
}

