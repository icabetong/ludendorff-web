import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../index";

export type Entity = {
  entityName?: string,
  entityPosition?: string,
}

export class EntityRepository {
  static async fetch(): Promise<Entity> {
    let ref = await getDoc(doc(firestore, "core", "entity"));
    return ref.data() as Entity
  }

  static async update(entity: Entity): Promise<void> {
    return await updateDoc(doc(firestore, "core", "entity"), entity)
  }
}
