import { collection, doc, getDocs, Timestamp, writeBatch } from "firebase/firestore";
import { firestore } from "../..";
import { inventoryCollection, items } from "../../shared/const";
import { TypeCore } from "../type/Type";

export type InventoryReport = {
  inventoryReportId: string,
  fundCluster?: string,
  entityName?: string,
  entityPosition?: string,
  yearMonth?: string,
  accountabilityDate?: Timestamp,
  items: InventoryReportItem[],
}

export type InventoryReportItem = {
  stockNumber: string,
  article?: string,
  description?: string,
  type?: TypeCore,
  unitOfMeasure?: string,
  unitValue: number,
  balancePerCard: number,
  onHandCount: number,
  remarks?: string
}

export class InventoryReportRepository {
  static async create(report: InventoryReport): Promise<void> {
    const { items, ...r } = report;
    let batch = writeBatch(firestore);
    let docReference = doc(firestore, inventoryCollection, report.inventoryReportId);

    batch.set(docReference, r);
    items.forEach((item) => {
      batch.set(doc(firestore, inventoryCollection, r.inventoryReportId), item);
    });

    return await batch.commit();
  }

  static async update(report: InventoryReport): Promise<void> {
    const { items, ...r } = report;

    let docReference = doc(firestore, inventoryCollection, report.inventoryReportId);

    let batch = writeBatch(firestore);

    let itemsRef = collection(firestore, inventoryCollection, `${ report.inventoryReportId }/${ items }`);
    let snapshot = await getDocs(itemsRef);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.set(docReference, r);
    items.forEach((item) => {
      batch.set(doc(firestore, inventoryCollection, r.inventoryReportId), item);
    });

    return await batch.commit();
  }

  static async remove(report: InventoryReport): Promise<void> {
    const { items, ...r } = report;

    let docReference = doc(firestore, inventoryCollection, r.inventoryReportId);
    let batch = writeBatch(firestore);

    let itemRef = collection(firestore, inventoryCollection, `${ report.inventoryReportId }/${ items }`);
    let snapshot = await getDocs(itemRef);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(docReference);
    return await batch.commit();
  }
}