import { collection, doc, getDocs, Timestamp, writeBatch } from "firebase/firestore";
import { httpsCallable, HttpsCallableResult } from "firebase/functions";
import { firestore, functions } from "../../index";
import { issuedCollection, issuedItems as itemsCollection } from "../../shared/const";

export type IssuedReport = {
  issuedReportId: string,
  entityName?: string,
  fundCluster?: string,
  serialNumber?: string,
  date?: Timestamp,
  items: IssuedReportItem[],
}

export type IssuedReportItem = {
  issuedReportItemId: string,
  stockNumber: string,
  description?: string,
  unitOfMeasure?: string,
  quantityIssued: number,
  unitCost: number,
  responsibilityCenter?: string,
}

export type GroupedIssuedReportItem = {
  [key: string]: IssuedReportItem[]
}

export function groupIssuedReportItemsByStockNumber(items: IssuedReportItem[]): GroupedIssuedReportItem {
  return items.reduce((r, a) => {
    r[a.stockNumber]  = [...r[a.stockNumber] || [], a];
    return r;
  }, {} as GroupedIssuedReportItem);
}

export class IssuedReportRepository {
  static async fetch(issuedId: string): Promise<IssuedReportItem[]> {
    let itemsRef = collection(firestore, issuedCollection, issuedId, itemsCollection);
    let snapshot = await getDocs(itemsRef);

    return snapshot.docs.map((doc) => {
      return doc.data() as IssuedReportItem
    });
  }

  static async create(issued: IssuedReport): Promise<HttpsCallableResult> {
    const { items, ...report } = issued;

    let batch = writeBatch(firestore);
    let docReference = doc(firestore, issuedCollection, report.issuedReportId);

    batch.set(docReference, report);
    items.forEach((item) => {
      batch.set(doc(firestore, issuedCollection, report.issuedReportId, itemsCollection, item.issuedReportItemId), item);
    });
    await batch.commit();

    const indexIssued = httpsCallable(functions, 'indexIssued');
    return await indexIssued({
      id: issued.issuedReportId,
      entries: items,
    });
  }

  static async update(issued: IssuedReport): Promise<HttpsCallableResult> {
    const { items, ...report } = issued;

    let docReference = doc(firestore, issuedCollection, report.issuedReportId);
    let batch = writeBatch(firestore);

    let itemRef = collection(firestore, issuedCollection,
      report.issuedReportId, itemsCollection);
    let snapshot = await getDocs(itemRef);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.set(docReference, report);
    items.forEach((item) => {
      batch.set(doc(firestore, issuedCollection, report.issuedReportId, itemsCollection, item.issuedReportItemId), item);
    });
    await batch.commit();

    const indexIssued = httpsCallable(functions, 'indexIssued');
    return await indexIssued({
      id: issued.issuedReportId,
      entries: items,
    });
  }

  static async remove(issued: IssuedReport): Promise<void> {
    const { items, ...r } = issued;

    let docReference = doc(firestore, issuedCollection, r.issuedReportId);
    let batch = writeBatch(firestore);

    let itemRef = collection(firestore, issuedCollection,
      r.issuedReportId, itemsCollection);
    let snapshot = await getDocs(itemRef);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(docReference);
    return await batch.commit();
  }
}