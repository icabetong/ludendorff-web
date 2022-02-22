import { increment, doc, writeBatch } from "firebase/firestore";
import { firestore } from "../../index";
import { Timestamp } from "@firebase/firestore-types";

import { CategoryCore } from '../category/Category';
import { Specification } from "../specs/Specification";
import {
  assetCollection,
  categoryCollection,
  categoryCount
} from "../../shared/const";

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
  switch (status) {
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

    let batch = writeBatch(firestore);
    assets.forEach((asset) => {
      batch.set(doc(firestore, assetCollection, asset.assetId), asset);
    })
    
    let id = assets[0].category?.categoryId;
    if (id) {
      batch.update(doc(firestore, categoryCollection, id), categoryCount, increment(assets.length))
    }
    return await batch.commit();
  }

  static async create(asset: Asset): Promise<void> {
    let batch = writeBatch(firestore);

    batch.set(doc(firestore, assetCollection, asset.assetId), asset);
    
    let id = asset.category?.categoryId;
    if (id) {
      batch.update(doc(firestore, categoryCollection, id), 
        categoryCollection, increment(1));
    }

    return await batch.commit()
  }

  static async update(asset: Asset, previousCategoryId?: string): Promise<void> {
    let batch = writeBatch(firestore);
    batch.set(doc(firestore, assetCollection, asset.assetId), asset)

    let currentCategoryId = asset.category?.categoryId;
    if (previousCategoryId && currentCategoryId && currentCategoryId !== previousCategoryId) {
      batch.update(doc(firestore, categoryCollection, currentCategoryId), categoryCount,
        increment(1))

      batch.update(doc(firestore, categoryCollection, previousCategoryId), categoryCount,
        increment(-1))
    }

    return batch.commit()
  }

  static async remove(asset: Asset): Promise<void> {
    let batch = writeBatch(firestore);

    batch.delete(doc(firestore, assetCollection, asset.assetId));

    let categoryId = asset.category?.categoryId;
    if (categoryId) {
      batch.update(doc(firestore, categoryCollection, categoryId), categoryCount, increment(-1));
    }

    return await batch.commit();
  }
}

