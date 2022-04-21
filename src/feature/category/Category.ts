import { collection, deleteDoc, doc, getDocs, query, setDoc, where, writeBatch } from "firebase/firestore";
import { firestore } from "../../index";

import { assetCategory, assetCategoryId, assetCollection, typeCollection, } from "../../shared/const";

export type Category = {
  categoryId: string,
  categoryName?: string,
  subcategories: string[],
  count: number
}

export type CategoryCore = {
  categoryId: string,
  categoryName?: string,
  subCollectionName?: string
}

export const minimize = (category: Category): CategoryCore => {
  return {
    categoryId: category.categoryId,
    categoryName: category.categoryName
  };
}

export class CategoryRepository {

  static async create(category: Category): Promise<void> {
    return await setDoc(doc(firestore, typeCollection, category.categoryId),
      { ...category });
  }

  static async update(category: Category): Promise<void> {
    let batch = writeBatch(firestore);

    batch.set(doc(firestore, typeCollection, category.categoryId),
      category)

    let assetTask = await getDocs(query(collection(firestore, assetCollection),
      where(assetCategoryId, '==', category.categoryId)));
    assetTask.docs.forEach(doc => {
      batch.update(doc.ref, assetCategory, minimize(category))
    });

    return batch.commit()
  }

  static async remove(category: Category): Promise<void> {
    return await deleteDoc(doc(firestore, typeCollection, category.categoryId));
  }
}