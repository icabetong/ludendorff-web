import { Box, Fab, Hidden, LinearProgress, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useReducer, useState } from "react";
import { getDataGridTheme } from "../core/Core";
import { connectHits, InstantSearch } from "react-instantsearch-dom";
import { Provider } from "../../components/Search";
import { useTranslation } from "react-i18next";
import { AddRounded, DeleteOutlineRounded, Inventory2Outlined } from "@mui/icons-material";

import { ActionType, initialState, reducer, } from "./InventoryReportEditorReducer";
import { DataGrid, GridActionsCellItem, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { usePermissions } from "../auth/AuthProvider";
import { InventoryReport, InventoryReportRepository } from "./InventoryReport";
import { usePagination } from "use-pagination-firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { firestore } from "../../index";
import InventoryReportList from "./InventoryReportList";
import InventoryReportEditor from "./InventoryReportEditor";

import {
  accountabilityDate,
  entityName,
  entityPosition,
  fundCluster,
  inventoryCollection,
  yearMonth,
} from "../../shared/const";
import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import { DataGridPaginationController } from "../../components/PaginationController";
import EmptyStateComponent from "../state/EmptyStates";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { HitsProvided } from "react-instantsearch-core";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import { formatDate, isDev } from "../../shared/utils";
import GridEmptyRow from "../../components/GridEmptyRows";
import { ScreenProps } from "../shared/ScreenProps";
import AdaptiveHeader from "../../components/AdaptiveHeader";
import useDensity from "../shared/useDensity";
import useColumnVisibilityModel from "../shared/useColumnVisibilityModel";
import useQueryLimit from "../shared/useQueryLimit";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%',
    width: '100%',
  },
  wrapper: {
    height: '90%',
    padding: '1.4em',
    ...getDataGridTheme(theme)
  }
}));

type InventoryReportScreenProps = ScreenProps
const InventoryReportScreen = (props: InventoryReportScreenProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canWrite } = usePermissions();
  const { density, onDensityChanged } = useDensity('inventoryDensity');
  const { limit, onLimitChanged } = useQueryLimit('inventoryQueryLimit');
  const [report, setReport] = useState<InventoryReport | undefined>(undefined);
  const [searchMode, setSearchMode] = useState(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<InventoryReport>(
    query(collection(firestore, inventoryCollection), orderBy(fundCluster, "asc")), {
      limit: limit
    }
  );

  const onRemoveInvoke = (report: InventoryReport) => setReport(report);
  const onRemoveDismiss = () => setReport(undefined);
  const onReportRemove = () => {
    if (report) {
      InventoryReportRepository.remove(report)
        .then(() => enqueueSnackbar(t("feedback.inventory_removed")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.inventory_remove_error"))
          if (isDev) console.log(error)
        })
        .finally(onRemoveDismiss)
    }
  }

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
          onClick={() => onRemoveInvoke(params.row as InventoryReport)}/>
      ],
    }
  ]
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('inventoryColumns', columns);

  const [state, dispatch] = useReducer(reducer, initialState)
  const onInventoryEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
  const onDataGridRowDoubleClicked = (params: GridRowParams) => {
    onInventoryReportSelected(params.row as InventoryReport)
  }

  const onInventoryReportSelected = (report: InventoryReport) => {
    dispatch({
      type: ActionType.UPDATE,
      payload: report
    })
  }

  const PaginationController = () => {
    return (
      isEnd && items.length > 0 && items.length === limit
        ? <DataGridPaginationController
            canBack={isStart}
            canForward={isEnd}
            onBackward={getPrev}
            onForward={getNext}
            size={limit}
            onPageSizeChanged={onLimitChanged}/>
        : <></>
    )
  }

  const dataGrid = (
    <DataGrid
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: StockCardDataGridEmptyRows,
        Toolbar: GridToolbar,
        Pagination: PaginationController
      }}
      rows={items}
      columns={columns}
      density={density}
      columnVisibilityModel={visibleColumns}
      loading={isLoading}
      getRowId={(r) => r.inventoryReportId}
      onRowDoubleClick={onDataGridRowDoubleClicked}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(newModel) =>
        onVisibilityChange(newModel)
      }/>
  )

  return (
    <Box className={classes.root}>
      <InstantSearch
        searchClient={Provider}
        indexName="inventories">
        <AdaptiveHeader
          title={t("navigation.inventories")}
          actionText={canWrite ? t("button.create_report") : undefined}
          onActionEvent={() => dispatch({ type: ActionType.CREATE })}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {canRead
          ? <>
            <Hidden smDown>
              <Box className={classes.wrapper}>
                {searchMode
                  ? <InventoryReportDataGrid
                    onItemSelect={onDataGridRowDoubleClicked}
                    onRemoveInvoke={onRemoveInvoke}/>
                  : dataGrid
                }
              </Box>
            </Hidden>
            <Hidden smUp>
              {!isLoading
                ? items.length < 1
                  ? <InventoryReportEmptyState/>
                  : <InventoryReportList
                    reports={items}
                    onItemSelect={onInventoryReportSelected}
                    onItemRemove={onRemoveInvoke}/>
                : <LinearProgress/>
              }
              <Fab
                color="primary"
                aria-label={t("button.add")}
                onClick={() => dispatch({ type: ActionType.CREATE })}>
                <AddRounded/>
              </Fab>
            </Hidden>
          </>
          : <ErrorNoPermissionState/>
        }
      </InstantSearch>
      <InventoryReportEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        report={state.report}
        onDismiss={onInventoryEditorDismiss}/>
      <ConfirmationDialog
        isOpen={report !== undefined}
        title="dialog.inventory_remove"
        summary="dialog.inventory_remove_summary"
        onConfirm={onReportRemove}
        onDismiss={onRemoveDismiss}/>
    </Box>
  )
}

const StockCardDataGridEmptyRows = () => {
  return (
    <GridEmptyRow>
      <InventoryReportEmptyState/>
    </GridEmptyRow>
  )
}

const InventoryReportEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={Inventory2Outlined}
      title={t("empty.inventory_header")}
      subtitle={t("empty.inventory_summary")}/>
  )
}

type InventoryReportDataGridProps = HitsProvided<InventoryReport> & {
  onItemSelect: (params: GridRowParams) => void,
  onRemoveInvoke: (report: InventoryReport) => void,
}
const InventoryReportDataGridCore = (props: InventoryReportDataGridProps) => {
  const { t } = useTranslation();
  const { density, onDensityChanged } = useDensity('inventoryDensity');

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
          onClick={() => props.onRemoveInvoke(params.row as InventoryReport)}/>
      ],
    }
  ]
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('inventoryColumns', columns);

  return (
    <DataGrid
      hideFooterPagination
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: StockCardDataGridEmptyRows,
        Toolbar: GridToolbar,
      }}
      rows={props.hits}
      columns={columns}
      density={density}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.inventoryReportId}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(newModel) =>
        onVisibilityChange(newModel)
      }
    />
  )
}
const InventoryReportDataGrid = connectHits<InventoryReportDataGridProps, InventoryReport>(InventoryReportDataGridCore)

export default InventoryReportScreen;