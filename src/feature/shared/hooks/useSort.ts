import { useEffect, useState } from "react";
import { GridSortModel } from "@mui/x-data-grid";
import { assetDescription } from "../../../shared/const";

export type UseSortValues = {
  sortMethod: GridSortModel,
  onSortMethodChange: (sortMethod: GridSortModel) => void,
}

export const useSort = (key: string) => {
  const [sortMethod, setSortMethod] = useState<GridSortModel>(() => {
    return [{
      field: assetDescription,
      sort: "asc"
    }] as GridSortModel
  });

  useEffect(() => {
    let item = localStorage.getItem(key);
    if (item) {
      let model = JSON.parse(item);
      setSortMethod(model);
    }
  }, [key]);

  const onSortMethodChange = (sortMethod: GridSortModel) => {
    setSortMethod(sortMethod);
    localStorage.setItem(key, JSON.stringify(sortMethod));
  }

  return { sortMethod, onSortMethodChange } as UseSortValues
}

export default useSort;