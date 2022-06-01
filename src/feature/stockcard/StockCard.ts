import { collection, doc, getDocs, Timestamp, writeBatch } from "firebase/firestore";
import { httpsCallable, HttpsCallableResult } from "firebase/functions";
import { firestore, functions } from "../../index";
import { entries as entriesCollection, stockCardCollection } from "../../shared/const";
import { Balances } from "../shared/types/Balances";
import { AuthData } from "../shared/types/AuthData";

export type StockCard = {
  stockCardId: string,
  entityName?: string,
  stockNumber?: string,
  description?: string,
  unitPrice: number,
  unitOfMeasure?: string,
  balances: Balances,
  entries: StockCardEntry[],
  auth?: AuthData,
}

export type StockCardEntry = {
  stockCardEntryId: string,
  date?: Timestamp, // add number
  reference?: string,
  receivedQuantity: number,
  requestedQuantity: number,
  issueQuantity: number,
  issueOffice?: string,
  inventoryReportSourceId?: string,
}

export class StockCardRepository {
  static async fetch(stockCardId: string): Promise<StockCardEntry[]> {
    let entriesRef = collection(firestore, stockCardCollection, stockCardId,
      entriesCollection);
    let snapshot = await getDocs(entriesRef);

    return snapshot.docs.map((doc) => {
      return doc.data() as StockCardEntry
    })
  }

  static async create(stockCard: StockCard): Promise<HttpsCallableResult> {
    const { entries, ...card } = stockCard;

    let batch = writeBatch(firestore);
    batch.set(doc(firestore, stockCardCollection, stockCard.stockCardId), card);

    stockCard.entries.forEach((entry: StockCardEntry) => {
      batch.set(doc(firestore, stockCardCollection,
          stockCard.stockCardId, entriesCollection, entry.stockCardEntryId),
        entry);
    });

    await batch.commit();

    const indexStockCard = httpsCallable(functions, 'indexStockCard');
    return await indexStockCard({
      id: stockCard.stockCardId,
      entries: entries,
    });
  }

  static async update(stockCard: StockCard): Promise<HttpsCallableResult> {
    const { entries, ...card } = stockCard;

    let batch = writeBatch(firestore);
    batch.set(doc(firestore, stockCardCollection, stockCard.stockCardId), card);

    let reference = collection(firestore, stockCardCollection,
      stockCard.stockCardId, entriesCollection);
    let snapshot = await getDocs(reference);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    stockCard.entries.forEach((entry: StockCardEntry) => {
      batch.set(doc(firestore, stockCardCollection,
          stockCard.stockCardId, entriesCollection, entry.stockCardEntryId),
        entry);
    });

    await batch.commit();
    const indexStockCard = httpsCallable(functions, 'indexStockCard');
    return await indexStockCard({
      id: stockCard.stockCardId,
      entries: entries,
    });
  }

  static async remove(stockCard: StockCard): Promise<void> {
    let batch = writeBatch(firestore);

    let reference = collection(firestore, stockCardCollection,
      stockCard.stockCardId, entriesCollection);
    let snapshot = await getDocs(reference);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(doc(firestore, stockCardCollection, stockCard.stockCardId));
    return await batch.commit();
  }
}