import { HitsProvided } from "react-instantsearch-core";
import { Department } from "./Department";
import { DataGridProps } from "../shared/types/DataGridProps";
import { DataGrid, GridRowParams, GridActionsCellItem, GridValueGetterParams } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { departmentManager, departmentName } from "../../shared/const";
import { DeleteOutlineRounded } from "@mui/icons-material";
import useDensity from "../shared/hooks/useDensity";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import GridLinearProgress from "../../components/datagrid/GridLinearProgress";
import { DepartmentDataGridEmptyState } from "./DepartmentEmptyState";
import GridToolbar from "../../components/datagrid/GridToolbar";
import { DataGridPaginationController } from "../../components/PaginationController";
import { connectHits } from "react-instantsearch-dom";

type DepartmentDataGridProps = HitsProvided<Department> & DataGridProps<Department> & {
  onItemSelect: (department: Department) => void,
  onRemoveInvoke: (department: Department) => void,
}
const DepartmentDataGridCore = (props: DepartmentDataGridProps) => {
  const { t } = useTranslation();
  const columns = [
    { field: departmentName, headerName: t("field.department_name"), flex: 1 },
    {
      field: departmentManager,
      headerName: t("field.manager"),
      flex: 2,
      valueGetter: (params: GridValueGetterParams) => {
        return params.row.manager ? params.row.manager.name : t("unknown");
      }
    },
    {
      field: "actions",
      type: "actions",
      flex: 0.5,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<DeleteOutlineRounded/>}
          label={t("button.delete")}
          onClick={() => props.onRemoveInvoke(params.row as Department)}/>
      ]
    }
  ];
  const { density, onDensityChanged } = useDensity('departmentDensity');
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('departmentSort', columns);

  return (
    <DataGrid
      hideFooterPagination={props.isSearching}
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: DepartmentDataGridEmptyState,
        Toolbar: GridToolbar,
        Pagination: props.canForward && props.items.length > 0 && props.items.length === props.size ? DataGridPaginationController : null
      }}
      componentsProps={{
        pagination: {
          size: props.size,
          canBack: props.canBack,
          canForward: props.canForward,
          onBackward: props.onBackward,
          onForward: props.onForward,
          onPageSizeChanged: props.onPageSizeChanged
        }
      }}
      sortingMode="server"
      columns={columns}
      rows={props.isSearching ? props.hits : props.items}
      loading={props.isLoading}
      density={density}
      sortModel={props.sortMethod}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.departmentId}
      onSortModelChange={(m, d) => {
        props?.onSortMethodChanged && props?.onSortMethodChanged(m)
      }}
      onRowDoubleClick={(p) => props.onItemSelect(p.row as Department)}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(c) => onVisibilityChange(c)}
    />
  )
}

const DepartmentDataGrid = connectHits<DepartmentDataGridProps, Department>(DepartmentDataGridCore);
export default DepartmentDataGrid;