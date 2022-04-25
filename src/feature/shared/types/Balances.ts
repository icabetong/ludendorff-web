// this type is only used internally
// used in computing the quantity values in the stock card
// with reference to the Physical Report of Inventories
// and the Stock Card Entry

// Dynamic type that stored the "Entry" of the Balances,
// the keys are the Inventory Report ID, the source
// of the onHandCount of the asset that will be used by various
// entries of the Stock Card.
export type Balances = {
  [key: string]: Entry
}

// An "Entry" stores the remaining quantity of the asset
// and the entries that is using it.
export type Entry = {
  remaining: number,
  entries: EntryQuantity
}

// Dynamic type that stores the Stock Card Entry ID
// as the key and the quantity is takes
export type EntryQuantity = {
  [key: string]: number
}