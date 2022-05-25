import { useEffect, useState } from "react";
import {
  FirestoreError,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  query,
  limit,
  limitToLast,
  startAfter,
  endAt,
  onSnapshot,
  getDocs,
} from "firebase/firestore";

export type UsePaginationValue<T> = {
  items: T[],
  isLoading: boolean,
  error: Error | null,
  canBack: boolean,
  canForward: boolean,
  onBackward: () => void,
  onForward: () => void,
}
function usePagination<T>(queryRef: Query, field: keyof T, queryLimit: number) {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [items, setItems] = useState<T[]>([]);
  const [start, setStart] = useState<T | null>(null);
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  let canBack = items.length > 0 && items.some((i) => i[field] === start![field]);
  let canForward = items.length < queryLimit;

  useEffect(() => {
    let reference = queryRef;
    const unsubscribe = onSnapshot(reference, (snapshot) => {
      setItems(snapshot.docs.map((doc) => doc.data() as T));

      if (snapshot.docs.length > 0) {
        let doc: QueryDocumentSnapshot = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(doc);
        setFirstVisible(snapshot.docs[0]);
        setStart(snapshot.docs[0].data() as T);
      }
    }, (error) => { setError(error) })

    setLoading(false);
    return () => unsubscribe();
  }, []);

  const onUpdateState = (documents: QuerySnapshot) => {
    if (!documents.empty) {
      setItems(documents.docs.map((doc) => doc.data() as T));
    }
    if (documents.docs[0]) setFirstVisible(documents.docs[0]);
    if (documents.docs[documents.docs.length - 1]) setLastVisible(documents.docs[documents.docs.length - 1]);
    setLoading(false);
  }

  const onBackward = async () => {
    setLoading(true);

    const first = firstVisible?.data() as T;
    const newQuery = query(queryRef, endAt(first![field]), limitToLast(queryLimit));
    const documents = await getDocs(newQuery);
    onUpdateState(documents);
  }

  const onForward = async () => {
    setLoading(true);

    const last = lastVisible?.data() as T;
    const newQuery = query(queryRef, startAfter(last![field]), limit(queryLimit));
    const documents = await getDocs(newQuery);
    onUpdateState(documents);
  }

  return { items, isLoading, error, canBack, canForward, onForward, onBackward } as UsePaginationValue<T>
}

export default usePagination;