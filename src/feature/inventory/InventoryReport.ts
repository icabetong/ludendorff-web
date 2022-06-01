import { collection, doc, getDocs, Timestamp, writeBatch } from "firebase/firestore";
import { httpsCallable, HttpsCallableResult } from "firebase/functions";
import { firestore, functions } from "../..";
import { inventoryCollection, inventoryItems as itemsCollection } from "../../shared/const";
import { CategoryCore } from "../category/Category";
import { AuthData } from "../shared/types/AuthData";

export type InventoryReport = {
  inventoryReportId: string,
  fundCluster?: string,
  entityName?: string,
  entityPosition?: string,
  yearMonth?: string,
  accountabilityDate?: Timestamp | number,
  auth?: AuthData,
  items: InventoryReportItem[],
}

export type InventoryReportItem = {
  stockNumber: string,
  article?: string,
  description?: string,
  category?: CategoryCore,
  unitOfMeasure?: string,
  unitValue: number,
  balancePerCard: number,
  onHandCount: number,
  remarks?: string,
  supplier?: string,
}

export class InventoryReportRepository {
  static async fetch(reportId: string): Promise<InventoryReportItem[]> {
    let itemsRef = collection(firestore, inventoryCollection, reportId, itemsCollection)
    let snapshot = await getDocs(itemsRef);

    return snapshot.docs.map((doc) => {
      return doc.data() as InventoryReportItem
    });
  }

  static async create(report: InventoryReport): Promise<HttpsCallableResult> {
    const { items, ...r } = report;
    let batch = writeBatch(firestore);
    let docReference = doc(firestore, inventoryCollection, report.inventoryReportId);

    batch.set(docReference, r);
    items.forEach((item) => {
      batch.set(doc(firestore, inventoryCollection,
        r.inventoryReportId, itemsCollection, item.stockNumber), item);
    });
    await batch.commit();

    const indexInventory = httpsCallable(functions, 'indexInventory');
    return await indexInventory({
      id: r.inventoryReportId,
      entries: items,
    });
  }

  static async update(report: InventoryReport): Promise<HttpsCallableResult> {
    const { items, ...r } = report;

    let docReference = doc(firestore, inventoryCollection, report.inventoryReportId);

    let batch = writeBatch(firestore);

    let itemsRef = collection(firestore, inventoryCollection,
      report.inventoryReportId, itemsCollection);
    let snapshot = await getDocs(itemsRef);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.set(docReference, r);
    items.forEach((item) => {
      batch.set(doc(firestore, inventoryCollection,
        r.inventoryReportId, itemsCollection, item.stockNumber), item);
    });

    await batch.commit();
    const indexInventory = httpsCallable(functions, 'indexInventory');
    return await indexInventory({
      id: r.inventoryReportId,
      entries: items,
    });
  }

  static async remove(report: InventoryReport): Promise<void> {
    const { items, ...r } = report;

    let docReference = doc(firestore, inventoryCollection, r.inventoryReportId);
    let batch = writeBatch(firestore);

    let itemRef = collection(firestore, inventoryCollection,
      report.inventoryReportId, itemsCollection);
    let snapshot = await getDocs(itemRef);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(docReference);
    return await batch.commit();
  }
}