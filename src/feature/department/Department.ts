import { firestore } from "../..";
import { deleteDoc, writeBatch, doc } from "firebase/firestore";

import { UserCore } from "../user/User";
import { minimize as minimizeDepartment } from "./Department";

import {
  departmentCollection,
  userCollection,
  department as departmentField
} from "../../shared/const";

export const minimize = (department: Department): DepartmentCore => {
  return {
    departmentId: department.departmentId,
    name: department.name
  }
}

export type Department = {
  departmentId: string,
  name?: string,
  manager?: UserCore,
  count: number
}

export type DepartmentCore = {
  departmentId: string,
  name?: string
}

export class DepartmentRepository {
  static async create(department: Department): Promise<void> {
    let batch = writeBatch(firestore);

    batch.set(doc(firestore, departmentCollection,
      department.departmentId), department);

    if (department.manager !== undefined)
      batch.update(doc(firestore, userCollection,
          department.manager?.userId), departmentField,
        minimizeDepartment(department))

    return await batch.commit();
  }

  static async update(department: Department): Promise<void> {
    let batch = writeBatch(firestore);

    if (department.manager !== undefined) {
      batch.update(doc(firestore, userCollection, department.manager?.userId), departmentField,
        minimizeDepartment(department))
    }

    batch.set(doc(firestore, departmentCollection, department.departmentId),
      department);

    return await batch.commit();
  }

  static async remove(department: Department): Promise<void> {
    return await deleteDoc(doc(firestore, departmentCollection,
      department.departmentId))
  }
}