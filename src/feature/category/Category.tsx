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
        return await firestore.collection(categoryCollection)
            .doc(category.categoryId)
            .set({...category})
    }

    static async update(category: Category): Promise<void> {
        let batch = firestore.batch()

        batch.set(firestore.collection(categoryCollection)
            .doc(category.categoryId), category)

        let assetTask = await firestore.collection(assetCollection)
            .where(assetCategoryId, "==", category.categoryId)
            .get()
        assetTask.docs.forEach(doc => {
            batch.update(doc.ref, assetCategory, minimize(category))
        })

        let assignmentTask = await firestore.collection(assignmentCollection)
            .where(assignmentAssetCategoryId, "==", category.categoryId)
            .get()

        assignmentTask.docs.forEach(doc => {
            batch.update(doc.ref, assignmentAssetCategory, minimize(category))
        })

        return batch.commit()
    }

    static async remove(category: Category): Promise<void> {
        return await firestore.collection(categoryCollection)
            .doc(category.categoryId)
            .delete()
    }
}