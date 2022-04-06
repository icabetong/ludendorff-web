import { GridColDef, GridColumnVisibilityModel } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

type UseColumnVisibilityModel = {
  visibleColumns: GridColumnVisibilityModel,
  onVisibilityChange: (model: GridColumnVisibilityModel) => void,
}
interface Model {
  [key: string]: boolean
}
const useColumnVisibilityModel = (key: string, columns: GridColDef[]) => {
  const [visibleColumns, setVisibleColumns] = useState<GridColumnVisibilityModel>(() => {
    let model: Model = {};
    columns.forEach((column: GridColDef) => {
      model[column.field] = column.hide ? column.hide : true
    });
    return model;
  });

  useEffect(() => {
    let item = localStorage.getItem(key);
    if (item) {
      let model = JSON.parse(item);
      setVisibleColumns(model);
    }
  }, [key])

  const onVisibilityChange = (model: GridColumnVisibilityModel) => {
    setVisibleColumns(model);
    localStorage.setItem(key, JSON.stringify(model));
  }

  return { visibleColumns, onVisibilityChange } as UseColumnVisibilityModel
}

export default useColumnVisibilityModel;