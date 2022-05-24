import { GridPaginationControllerProps } from "../../../components/datagrid/GridPaginationController";
import { GridSortModel } from "@mui/x-data-grid";

export type DataGridProps<T> = GridPaginationControllerProps & {
  items: T[],
  isLoading?: boolean,
  isSearching?: boolean,
  sortMethod?: GridSortModel,
  onSortMethodChanged?: (sortMethod: GridSortModel) => void,
}