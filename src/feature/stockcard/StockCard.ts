import { doc, Timestamp, writeBatch } from "firebase/firestore";
import { firestore } from "../../index";
import { entries, stockCardCollection } from "../../shared/const";

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
  static async create(stockCard: StockCard): Promise<void> {
    let batch = writeBatch(firestore);
    batch.set(doc(firestore, stockCardCollection, stockCard.stockCardId), stockCard)

    stockCard.entries.forEach((entry: StockCardEntry) => {
      batch.set(doc(firestore, `${stockCard.stockCardId}/${entries}/${entry.stockCardEntryId}`),
        entry);
    });
  }
}