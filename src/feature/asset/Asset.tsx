import { increment, doc, writeBatch } from "firebase/firestore";
import { firestore } from "../../index";
import { Timestamp } from "@firebase/firestore-types";

import { TypeCore } from '../type/Type';
import { Specification } from "../specs/Specification";
import {
  assetCollection,
  typeCollection,
  typeCount
} from "../../shared/const";

export type Asset = {
  stockNumber: string,
  description?: string,
  dateCreated?: Timestamp,
  status?: Status,
  type?: TypeCore,
  specifications?: Specification,
}

export type AssetCore = {
  assetId: string,
  assetName?: string,
  status?: Status,
  category?: TypeCore
}

export const minimize = (asset: Asset): AssetCore => {
  let core: AssetCore = {
    assetId: asset.stockNumber,
    assetName: asset.description,
    status: asset.status,
    category: asset.type
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
      batch.set(doc(firestore, assetCollection, asset.stockNumber), asset);
    })
    
    let id = assets[0].type?.typeId;
    if (id) {
      batch.update(doc(firestore, typeCollection, id), typeCount, increment(assets.length))
    }
    return await batch.commit();
  }

  static async create(asset: Asset): Promise<void> {
    let batch = writeBatch(firestore);

    batch.set(doc(firestore, assetCollection, asset.stockNumber), asset);
    
    let id = asset.type?.typeId;
    if (id) {
      batch.update(doc(firestore, typeCollection, id), 
        typeCollection, increment(1));
    }

    return await batch.commit()
  }

  static async update(asset: Asset, previousCategoryId?: string): Promise<void> {
    let batch = writeBatch(firestore);
    batch.set(doc(firestore, assetCollection, asset.stockNumber), asset)

    let currentCategoryId = asset.type?.typeId;
    if (previousCategoryId && currentCategoryId && currentCategoryId !== previousCategoryId) {
      batch.update(doc(firestore, typeCollection, currentCategoryId), typeCount,
        increment(1))

      batch.update(doc(firestore, typeCollection, previousCategoryId), typeCount,
        increment(-1))
    }

    return batch.commit()
  }

  static async remove(asset: Asset): Promise<void> {
    let batch = writeBatch(firestore);

    batch.delete(doc(firestore, assetCollection, asset.stockNumber));

    let categoryId = asset.type?.typeId;
    if (categoryId) {
      batch.update(doc(firestore, typeCollection, categoryId), typeCount, increment(-1));
    }

    return await batch.commit();
  }
}

