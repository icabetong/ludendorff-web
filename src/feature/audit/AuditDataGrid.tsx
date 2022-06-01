import { useTranslation } from "react-i18next";
import { HitsProvided, connectHits } from "react-instantsearch-core";
import { Chip } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridRowParams,
  GridSortModel,
  GridState,
  GridValueGetterParams,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { DeleteOutlineRounded } from "@mui/icons-material";
import { AuditLog, DataType, Operation } from "../audit/Audit";
import { AuditDataGridEmptyState } from "./AuditEmptyState";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import useDensity from "../shared/hooks/useDensity";
import { DataGridProps } from "../shared/types/DataGridProps";
import { GridLinearProgress } from "../../components/datagrid/GridLinearProgress";
import { GridPaginationController } from "../../components/datagrid/GridPaginationController";
import { GridToolbar } from "../../components/datagrid/GridToolbar";

type AuditDataGridProps = HitsProvided<AuditLog<any>> & DataGridProps<AuditLog<any>> & {
  onItemSelect: (params: GridRowParams) => void,
  onRemoveInvoke: (audit: AuditLog<any>) => void,
}
const AuditDataGridCore = (props: AuditDataGridProps) => {
  const { t } = useTranslation();
  const { density, onDensityChanged } = useDensity('auditDensity');

  const columns = [
    {
      field: "logEntryId",
      headerName: t("field.log_entry_id"),
      sortable: false,
    },
    {
      field: "user",
      headerName: t("field.name"),
      sortable: false,
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        const auditLog = params.row as AuditLog<any>;
        return auditLog.user.name;
      }
    },
    {
      field: "email",
      headerName: t("field.email"),
      sortable: false,
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        const auditLog = params.row as AuditLog<any>;
        return auditLog.user.email;
      }
    },
    {
      field: "operation",
      headerName: t("field.operation"),
      sortable: false,
      flex: 0.5,
      renderCell: (params: GridRenderCellParams<Operation>) => {
        const color = params.value !== 'remove' ? 'info' : 'warning';
        return (
          <Chip
            color={color}
            label={t(`operation.${params.value}`)}
            size={density === 'compact' ? 'small' : 'medium'}/>
        )
      }
    },
    {
      field: "dataType",
      headerName: t("field.data_type"),
      sortable: false,
      flex: 0.5,
      renderCell: (params: GridRenderCellParams<DataType>) => {
        return (
          <Chip
            label={t(`types.${params.value}`)}
            size={density === 'compact' ? 'small' : 'medium'}/>
        )
      }
    },
    {
      field: "identifier",
      headerName: t("field.identifier"),
      sortable: false,
      flex: 0.5,
    },
    {
      field: "actions",
      type: "actions",
      flex: 0.5,
      getActions: (params: GridRowParams) => {
        const auditLog = params.row as AuditLog<any>;
        return [
          <GridActionsCellItem
            showInMenu
            icon={<DeleteOutlineRounded/>}
            label={t("button.delete")}
            onClick={() => props.onRemoveInvoke(auditLog)}/>,
        ]
      },
    }
  ]

  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('auditColumns', columns);

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
        NoRowsOverlay: AuditDataGridEmptyState,
        Toolbar: GridToolbar,
        Pagination: hideFooter ? null : GridPaginationController,
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
      sortModel={props.sortMethod}
      columns={columns}
      rows={props.isSearching ? props.hits : props.items}
      density={density}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.logEntryId}
      onSortModelChange={onHandleSortModelChange}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={onHandleGridStateChange}
      onColumnVisibilityModelChange={onVisibilityChange}/>
  )
}

const AuditDataGrid = connectHits<AuditDataGridProps, AuditLog<any>>(AuditDataGridCore);
export default AuditDataGrid;