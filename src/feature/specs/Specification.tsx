// Since Firestore doesn't accept maps
// we need to explicitly create a type
// that has dynamic keys
export type Specification = {
  [key: string]: string
}