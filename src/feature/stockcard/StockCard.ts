import { collection, doc, getDocs, Timestamp, writeBatch } from "firebase/firestore";
import { firestore } from "../../index";
import { entries as entriesCollection, stockCardCollection } from "../../shared/const";
import axios from "axios";
import { getIdTokenRefreshed } from "../user/User";
import { SERVER_URL } from "../../shared/utils";

export type StockCard = {
  stockCardId: string,
  entityName?: string,
  stockNumber?: string,
  description?: string,
  unitPrice: number,
  unitOfMeasure?: string,
  entries: StockCardEntry[]
}

export type StockCardEntry = {
  stockCardEntryId: string,
  date?: Timestamp,
  reference?: string,
  receiptQuantity: number,
  requestedQuantity: number,
  issueQuantity: number,
  issueOffice?: string,
  balanceQuantity: number,
  balanceTotalPrice: number,
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

  static async create(stockCard: StockCard): Promise<void> {
    const { entries, ...card } = stockCard;

    let batch = writeBatch(firestore);
    batch.set(doc(firestore, stockCardCollection, stockCard.stockCardId), card);

    stockCard.entries.forEach((entry: StockCardEntry) => {
      batch.set(doc(firestore, stockCardCollection,
          stockCard.stockCardId, entriesCollection, entry.stockCardEntryId),
        entry);
    });

    await batch.commit();

    let token = await getIdTokenRefreshed();
    return await axios.patch(`${SERVER_URL}/stock-card-entries`, {
      token: token,
      id: stockCard.stockCardId,
      entries: entriesCollection,
    });
  }

  static async update(stockCard: StockCard): Promise<void> {
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

    let token = await getIdTokenRefreshed();
    return await axios.patch(`${SERVER_URL}/stock-card-entries`, {
      token: token,
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