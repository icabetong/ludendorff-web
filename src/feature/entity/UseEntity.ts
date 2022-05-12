import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { Entity, EntityRepository } from "./Entity";
import { firestore } from "../../index";

export type UseEntityValues = {
  entity: Entity,
  onEntityChanged: (entity: Entity) => void,
}
export const useEntity = () => {
  const [entity, setEntity] = useState<Entity | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(firestore, "core", "entity"), (doc) => {
      setEntity(doc.data() as Entity)
    })

    return () => {
      unsubscribe();
    }
  }, []);

  const onEntityChanged = async (entity: Entity) => {
    await EntityRepository.update(entity);
  }

  return { entity, onEntityChanged }
}