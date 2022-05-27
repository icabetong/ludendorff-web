import { useTranslation } from "react-i18next";
import { HitsProvided, connectHits } from "react-instantsearch-core";
import {
  DataGrid,
  GridActionsCellItem,
  GridRowParams,
  GridSortModel,
  GridState,
  GridValueGetterParams
} from "@mui/x-data-grid";
import { DeleteOutlineRounded } from "@mui/icons-material";
import { InventoryReport } from "./InventoryReport";
import { InventoryReportDataGridEmptyState } from "./InventoryReportEmptyState";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import useDensity from "../shared/hooks/useDensity";
import { DataGridProps } from "../shared/types/DataGridProps";
import { GridLinearProgress } from "../../components/datagrid/GridLinearProgress";
import { GridPaginationController } from "../../components/datagrid/GridPaginationController";
import { GridToolbar } from "../../components/datagrid/GridToolbar";
import { ExcelIcon } from "../../components/CustomIcons";
import { accountabilityDate, fundCluster, yearMonth } from "../../shared/const";
import { formatDate, formatTimestamp } from "../../shared/utils";
import { Timestamp } from "firebase/firestore";

type InventoryReportDataGridProps = HitsProvided<InventoryReport> & DataGridProps<InventoryReport> & {
  onItemSelect: (params: GridRowParams) => void,
  onExportSpreadsheet: (report: InventoryReport) => void,
  onRemoveInvoke: (report: InventoryReport) => void,
}

const InventoryReportDataGridCore = (props: InventoryReportDataGridProps) => {
  const { t } = useTranslation();
  const columns = [
    {
      field: fundCluster,
      headerName: t("field.fund_cluster"),
      sortable: false,
      flex: 1
    },
    {
      field: yearMonth,
      headerName: t("field.year_month"),
      sortable: false,
      flex: 1
    },
    {
      field: accountabilityDate,
      headerName: t("field.accountability_date"),
      sortable: false,
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        const date = params.row.accountabilityDate;

        if (date) {
          if (date instanceof Timestamp)
            return formatTimestamp(date);
          else return formatDate(new Date(date));
        } else return t("unknown")
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
          onClick={() => props.onRemoveInvoke(params.row as InventoryReport)}/>,
        <GridActionsCellItem
          showInMenu
          icon={<ExcelIcon/>}
          label={t("button.export_spreadsheet")}
          onClick={() => props.onExportSpreadsheet(params.row as InventoryReport)}/>
      ],
    }
  ];
  const { density, onDensityChanged } = useDensity('inventoryDensity');
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('inventoryColumns', columns);

  const onHandleSortModelChange = (model: GridSortModel) => props.onSortMethodChanged && props.onSortMethodChanged(model);
  const onHandleGridStateChange = (state: GridState) => onDensityChanged(state.density.value);

  const hideFooter = props.isSearching || props.items.length === 0
  return (
    <DataGrid
      disableColumnFilter
      hideFooter={hideFooter}
      hideFooterPagination={hideFooter}
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: InventoryReportDataGridEmptyState,
        Toolbar: GridToolbar,
        Pagination: hideFooter ? null : GridPaginationController,
      }}
      componentsProps={{
        pagination: {
          canBack: props.canBack,
          canForward: props.canForward,
          onBackward: props.onBackward,
          onForward: props.onForward,
        }
      }}
      sortingMode="server"
      rows={props.isSearching ? props.hits : props.items}
      columns={columns}
      loading={props.isLoading}
      density={density}
      sortModel={props.sortMethod}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.inventoryReportId}
      onSortModelChange={onHandleSortModelChange}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={onHandleGridStateChange}
      onColumnVisibilityModelChange={onVisibilityChange}/>
  )
}

const InventoryReportDataGrid = connectHits<InventoryReportDataGridProps, InventoryReport>(InventoryReportDataGridCore);
export default InventoryReportDataGrid;