import { doc, increment, writeBatch } from "firebase/firestore";
import { firestore } from "../../index";

import { TypeCore } from '../type/Type';
import { assetCollection, typeCollection, typeCount } from "../../shared/const";

export type Asset = {
  stockNumber: string,
  description?: string,
  type?: TypeCore,
  classification?: string,
  unitOfMeasure?: string,
  unitValue: number,
  remarks?: string,
}

export class AssetRepository {

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

