import { ReactNode, createContext, useEffect, useState, useContext } from "react";
import { collection, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { Category } from "./Category";
import { categoryCollection } from "../../shared/const";
import { firestore } from "../../index";

type CategoryProviderProps = {
  children: ReactNode
}

export const CategoryContext = createContext<Category[]>([]);

export const CategoryProvider = ({ children }: CategoryProviderProps) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const reference = collection(firestore, categoryCollection);
    const unsubscribe = onSnapshot(reference, (snapshot: QuerySnapshot) => {
      setCategories(snapshot.docs.map((doc) => doc.data() as Category))
    });

    return () => unsubscribe();
  }, []);

  return (
    <CategoryContext.Provider value={categories}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories(): Category[] {
  return useContext(CategoryContext);
}