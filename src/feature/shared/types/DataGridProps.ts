import { DataGridPaginationControllerProps } from "../../../components/PaginationController";

export type DataGridProps<T> = DataGridPaginationControllerProps & {
  items: T[],
  isLoading?: boolean,
  isSearching?: boolean,
}