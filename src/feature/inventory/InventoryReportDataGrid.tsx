import { HitsProvided } from "react-instantsearch-core";
import { InventoryReport } from "./InventoryReport";
import { DataGrid, GridActionsCellItem, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { DataGridProps } from "../shared/types/DataGridProps";
import { useTranslation } from "react-i18next";
import { accountabilityDate, entityName, entityPosition, fundCluster, yearMonth } from "../../shared/const";
import { formatDate } from "../../shared/utils";
import { DeleteOutlineRounded } from "@mui/icons-material";
import { ExcelIcon } from "../../components/CustomIcons";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import useDensity from "../shared/hooks/useDensity";
import GridLinearProgress from "../../components/datagrid/GridLinearProgress";
import GridToolbar from "../../components/datagrid/GridToolbar";
import { DataGridPaginationController } from "../../components/PaginationController";
import { InventoryReportDataGridEmptyState } from "./InventoryReportEmptyState";
import { connectHits } from "react-instantsearch-dom";

type InventoryReportDataGridProps = HitsProvided<InventoryReport> & DataGridProps<InventoryReport> & {
  onItemSelect: (params: GridRowParams) => void,
  onExportSpreadsheet: (report: InventoryReport) => void,
  onRemoveInvoke: (report: InventoryReport) => void,
}

const InventoryReportDataGridCore = (props: InventoryReportDataGridProps) => {
  const { t } = useTranslation();
  const columns = [
    { field: fundCluster, headerName: t("field.fund_cluster"), flex: 1 },
    { field: entityName, headerName: t("field.entity_name"), flex: 1 },
    { field: entityPosition, headerName: t("field.entity_position"), flex: 1 },
    { field: yearMonth, headerName: t("field.year_month"), flex: 1 },
    {
      field: accountabilityDate,
      headerName: t("field.accountability_date"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        const formatted = formatDate(params.row.accountabilityDate);
        return t(formatted)
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

  return (
    <DataGrid
      hideFooterPagination={props.isSearching}
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: InventoryReportDataGridEmptyState,
        Toolbar: GridToolbar,
        Pagination: props.canForward && props.items.length > 0 && props.items.length === props.size ? DataGridPaginationController : null,
      }}
      componentsProps={{
        pagination: {
          size: props.size,
          canBack: props.canBack,
          canForward: props.canForward,
          onBackward: props.onBackward,
          onForward: props.onForward,
          onPageSizeChanged: props.onPageSizeChanged,
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
      onSortModelChange={(m, d) => {
        props?.onSortMethodChanged && props?.onSortMethodChanged(m);
      }}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(c) => onVisibilityChange(c)}/>
  )
}

const InventoryReportDataGrid = connectHits<InventoryReportDataGridProps, InventoryReport>(InventoryReportDataGridCore);
export default InventoryReportDataGrid;