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
  typeCollection,
  assetType,
  assetTypeId,
} from "../../shared/const";

export type Type = {
  typeId: string,
  typeName?: string,
  count: number
}

export type TypeCore = {
  typeId: string,
  typeName?: string
}

export const minimize = (category: Type): TypeCore => {
  let core: TypeCore = {
    typeId: category.typeId,
    typeName: category.typeName
  }
  return core;
}

export class TypesRepository {

  static async create(type: Type): Promise<void> {
    return await setDoc(doc(firestore, typeCollection, type.typeId),
      {...type});
  }

  static async update(type: Type): Promise<void> {
    let batch = writeBatch(firestore);

    batch.set(doc(firestore, typeCollection, type.typeId),
      type)

    let assetTask = await getDocs(query(collection(firestore, assetCollection), 
      where(assetTypeId, '==', type.typeId)));
    assetTask.docs.forEach(doc => {
      batch.update(doc.ref, assetType, minimize(type))
    });

    return batch.commit()
  }

  static async remove(type: Type): Promise<void> {
    return await deleteDoc(doc(firestore, typeCollection, type.typeId));
  }
}