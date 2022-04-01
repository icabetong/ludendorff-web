import { collection, doc, getDocs, Timestamp, writeBatch } from "firebase/firestore";
import { firestore } from "../../index";
import { issuedCollection, items } from "../../shared/const";

export type IssuedReport = {
  issuedReportId: string,
  entityName?: string,
  fundCluster?: string,
  serialNumber?: string,
  date?: Timestamp,
  items: IssuedReportItem[],
}

export type IssuedReportItem = {
  stockNumber: string,
  description?: string,
  unitOfMeasure?: string,
  quantityIssued: number,
  unitCost: number,
  responsibilityCenter?: string,
}

export class IssuedReportRepository {
  static async fetch(issuedId: string): Promise<IssuedReportItem[]> {
    let itemsRef = collection(firestore, issuedCollection, `${issuedId}/${items}`);
    let snapshot = await getDocs(itemsRef);

    return snapshot.docs.map((doc) => {
      return doc.data() as IssuedReportItem
    });
  }

  static async create(issued: IssuedReport): Promise<void> {
    const { items, ...r } = issued;

    let batch = writeBatch(firestore);
    let docReference = doc(firestore, issuedCollection, r.issuedReportId);

    batch.set(docReference, r);
    items.forEach((item) => {
      batch.set(doc(firestore, issuedCollection, r.issuedReportId), item);
    });

    return await batch.commit();
  }

  static async update(issued: IssuedReport): Promise<void> {
    const { items, ...r } = issued;

    let docReference = doc(firestore, issuedCollection, r.issuedReportId);
    let batch = writeBatch(firestore);

    let itemRef = collection(firestore, issuedCollection, `${r.issuedReportId}/${items}`);
    let snapshot = await getDocs(itemRef);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.set(docReference, r);
    items.forEach((item) => {
      batch.set(doc(firestore, issuedCollection, r.issuedReportId), r);
    });

    return await batch.commit();
  }

  static async remove(issued: IssuedReport): Promise<void> {
    const { items, ...r } = issued;

    let docReference = doc(firestore, issuedCollection, r.issuedReportId);
    let batch = writeBatch(firestore);

    let itemRef = collection(firestore, issuedCollection, `${r.issuedReportId}/${items}`);
    let snapshot = await getDocs(itemRef);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(docReference);
    return await batch.commit();
  }
}