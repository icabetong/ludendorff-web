import { HitsProvided } from "react-instantsearch-core";
import { IssuedReport } from "./IssuedReport";
import { DataGridProps } from "../shared/types/DataGridProps";
import { DataGrid, GridActionsCellItem, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import useDensity from "../shared/hooks/useDensity";
import { date, entityName, fundCluster, serialNumber } from "../../shared/const";
import { formatDate } from "../../shared/utils";
import { DeleteOutlineRounded } from "@mui/icons-material";
import { ExcelIcon } from "../../components/CustomIcons";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import { connectHits } from "react-instantsearch-dom";
import { IssuedReportDataGridEmptyState } from "./IssuedReportEmptyState";
import { DataGridPaginationController } from "../../components/PaginationController";

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
    { field: entityName, headerName: t("field.entity_name"), flex: 1 },
    { field: serialNumber, headerName: t("field.serial_number"), flex: 1 },
    {
      field: date,
      headerName: t("field.date"),
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

  return (
    <DataGrid
      hideFooterPagination={props.isSearching}
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: IssuedReportDataGridEmptyState,
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
          onPageSizeChanged: props.onPageSizeChanged
        }
      }}
      rows={props.isSearching ? props.hits : props.items}
      columns={columns}
      density={density}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.issuedReportId}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(c) => onVisibilityChange(c)}/>
  )
}
const IssuedReportDataGrid = connectHits<IssuedReportDataGridProps, IssuedReport>(IssuedReportDataGridCore);
export default IssuedReportDataGrid;