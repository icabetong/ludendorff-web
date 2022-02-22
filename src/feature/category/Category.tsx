import { 
  writeBatch, 
  doc, setDoc, 
  getDocs, 
  collection, 
  deleteDoc, 
  query, 
  where 
} from "firebase/firestore";
import { firestore } from "../../index";

import {
  assetCollection,
  categoryCollection,
  assignmentCollection,
  assetCategory,
  assetCategoryId,
  assignmentAssetCategory,
  assignmentAssetCategoryId
} from "../../shared/const";

export type Category = {
  categoryId: string,
  categoryName?: string,
  count: number
}

export type CategoryCore = {
  categoryId: string,
  categoryName?: string
}

export const minimize = (category: Category): CategoryCore => {
  let core: CategoryCore = {
    categoryId: category.categoryId,
    categoryName: category.categoryName
  }
  return core;
}

export class CategoryRepository {

  static async create(category: Category): Promise<void> {
    return await setDoc(doc(firestore, categoryCollection, category.categoryId), 
      {...category});
  }

  static async update(category: Category): Promise<void> {
    let batch = writeBatch(firestore);

    batch.set(doc(firestore, categoryCollection, category.categoryId), 
      category)

    let assetTask = await getDocs(query(collection(firestore, assetCollection), 
      where(assetCategoryId, '==', category.categoryId)));
    assetTask.docs.forEach(doc => {
      batch.update(doc.ref, assetCategory, minimize(category))
    });

    let assignmentTask = await getDocs(query(collection(firestore, assignmentCollection), 
      where(assignmentAssetCategoryId, "==", category.categoryId)));
    assignmentTask.docs.forEach(doc => {
      batch.update(doc.ref, assignmentAssetCategory, minimize(category))
    })

    return batch.commit()
  }

  static async remove(category: Category): Promise<void> {
    return await deleteDoc(doc(firestore, categoryCollection, category.categoryId));
  }
}