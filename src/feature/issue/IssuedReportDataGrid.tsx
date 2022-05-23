import { useTranslation } from "react-i18next";
import { HitsProvided, connectHits } from "react-instantsearch-core";
import { DataGrid, GridActionsCellItem, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { DeleteOutlineRounded } from "@mui/icons-material";
import { IssuedReport } from "./IssuedReport";
import { IssuedReportDataGridEmptyState } from "./IssuedReportEmptyState";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import useDensity from "../shared/hooks/useDensity";
import { DataGridProps } from "../shared/types/DataGridProps";
import { DataGridPaginationController, ExcelIcon, GridLinearProgress, GridToolbar } from "../../components";
import { date, fundCluster, serialNumber } from "../../shared/const";
import { formatDate } from "../../shared/utils";

type IssuedReportDataGridProps = HitsProvided<IssuedReport> & DataGridProps<IssuedReport> & {
  onItemSelect: (params: GridRowParams) => void,
  onExportSpreadsheet: (report: IssuedReport) => void,
  onRemoveInvoke: (report: IssuedReport) => void,
}
const IssuedReportDataGridCore = (props: IssuedReportDataGridProps) => {
  const { t } = useTranslation();
  const { density, onDensityChanged } = useDensity('issuedDensity');

  const columns = [
    { field: fundCluster, headerName: t("field.fund_cluster"), flex: 1 },
    { field: serialNumber, headerName: t("field.serial_number"), flex: 1 },
    {
      field: date,
      headerName: t("field.date"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        const formatted = formatDate(params.row.date);
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
          onClick={() => props.onRemoveInvoke(params.row as IssuedReport)}/>,
        <GridActionsCellItem
          showInMenu
          icon={<ExcelIcon/>}
          label={t("button.export_spreadsheet")}
          onClick={() => props.onExportSpreadsheet(params.row as IssuedReport)}/>
      ],
    }
  ];
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('issuedColumns', columns);

  const hideFooter = props.isSearching
  return (
    <DataGrid
      hideFooter={hideFooter}
      hideFooterPagination={hideFooter}
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: IssuedReportDataGridEmptyState,
        Toolbar: GridToolbar,
        Pagination: hideFooter ? null : DataGridPaginationController,
      }}
      componentsProps={{
        pagination: {
          canBack: props.canBack,
          canForward: props.canForward,
          onBackward: props.onBackward,
          onForward: props.onForward
        }
      }}
      sortingMode="server"
      rows={props.isSearching ? props.hits : props.items}
      columns={columns}
      density={density}
      sortModel={props.sortMethod}
      onSortModelChange={(m, d) => {
        props?.onSortMethodChanged && props?.onSortMethodChanged(m);
      }}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.issuedReportId}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(c) => onVisibilityChange(c)}/>
  )
}
const IssuedReportDataGrid = connectHits<IssuedReportDataGridProps, IssuedReport>(IssuedReportDataGridCore);
export default IssuedReportDataGrid;