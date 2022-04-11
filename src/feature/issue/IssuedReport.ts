import { collection, doc, getDocs, Timestamp, writeBatch } from "firebase/firestore";
import { firestore } from "../../index";
import { issuedCollection, items as itemsCollection } from "../../shared/const";
import { getIdTokenRefreshed } from "../user/User";
import axios from "axios";
import { SERVER_URL } from "../../shared/utils";

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
    let itemsRef = collection(firestore, issuedCollection, issuedId, itemsCollection);
    let snapshot = await getDocs(itemsRef);

    return snapshot.docs.map((doc) => {
      return doc.data() as IssuedReportItem
    });
  }

  static async create(issued: IssuedReport): Promise<void> {
    const { items, ...report } = issued;

    let batch = writeBatch(firestore);
    let docReference = doc(firestore, issuedCollection, report.issuedReportId);

    batch.set(docReference, report);
    items.forEach((item) => {
      batch.set(doc(firestore, issuedCollection, report.issuedReportId, itemsCollection, item.stockNumber), item);
    });

    await batch.commit();

    let token = await getIdTokenRefreshed();
    return await axios.patch(`${SERVER_URL}/issued-items`, {
      token: token,
      id: issued.issuedReportId,
      items: items
    });
  }

  static async update(issued: IssuedReport): Promise<void> {
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
      batch.set(doc(firestore, issuedCollection, report.issuedReportId, itemsCollection, item.stockNumber), item);
    });

    await batch.commit();

    let token = await getIdTokenRefreshed();
    return await axios.patch(`${SERVER_URL}/issued-items`, {
      token: token,
      id: issued.issuedReportId,
      items: items
    });
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