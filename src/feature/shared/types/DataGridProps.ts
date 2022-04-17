import { DataGridPaginationControllerProps } from "../../../components/PaginationController";
import { GridSortModel } from "@mui/x-data-grid";

export type DataGridProps<T> = DataGridPaginationControllerProps & {
  items: T[],
  isLoading?: boolean,
  isSearching?: boolean,
  sortMethod?: GridSortModel,
  onSortMethodChanged?: (sortMethod: GridSortModel) => void,
}