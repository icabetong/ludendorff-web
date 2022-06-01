import { Timestamp, doc, deleteDoc } from "firebase/firestore";
import { AuthData } from "../shared/types/AuthData";
import { firestore } from "../../index";

export type DataType = "asset" | "inventory" | "issued" | "stockCard" | "user";
export type Operation = "create" | "update" | "remove";
export type OperationData<T> = {
  before?: T,
  after?: T,
}
export type AuditLog<T> = {
  logEntryId: string,
  user: AuthData,
  dataType: DataType,
  identifier: string,
  data?: OperationData<T>,
  timestamp: Timestamp | number,
  operation: Operation,
}

export class AuditLogRepository {
  static async remove(auditLog: AuditLog<any>): Promise<void> {
    await deleteDoc(doc(firestore, "logs", auditLog.logEntryId));
  }
}