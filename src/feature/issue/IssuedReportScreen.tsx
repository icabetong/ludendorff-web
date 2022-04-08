import { Box, Fab, Hidden, LinearProgress, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { getDataGridTheme } from "../core/Core";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { usePermissions } from "../auth/AuthProvider";
import { useReducer, useState } from "react";
import { IssuedReport, IssuedReportRepository } from "./IssuedReport";
import { usePagination } from "use-pagination-firestore";
import { date, entityName, fundCluster, issuedCollection, serialNumber } from "../../shared/const";
import { collection, orderBy, query } from "firebase/firestore";
import { firestore } from "../../index";
import { formatDate, isDev } from "../../shared/utils";
import { DataGrid, GridActionsCellItem, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { AddRounded, DeleteOutlineRounded, UploadFileOutlined } from "@mui/icons-material";
import { ActionType, initialState, reducer } from "./IssuedReportEditorReducer";
import { DataGridPaginationController } from "../../components/PaginationController";
import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import { connectHits, InstantSearch } from "react-instantsearch-dom";
import { Provider } from "../../components/Search";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import EmptyStateComponent from "../state/EmptyStates";
import { HitsProvided } from "react-instantsearch-core";
import IssuedReportList from "./IssuedReportList";
import IssuedReportEditor from "./IssuedReportEditor";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import { ScreenProps } from "../shared/ScreenProps";
import GridEmptyRow from "../../components/GridEmptyRows";
import AdaptiveHeader from "../../components/AdaptiveHeader";
import useDensity from "../shared/useDensity";
import useColumnVisibilityModel from "../shared/useColumnVisibilityModel";
import useQueryLimit from "../shared/useQueryLimit";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%',
    width: '100%'
  },
  wrapper: {
    height: '90%',
    padding: '1.4em',
    ...getDataGridTheme(theme)
  }
}));

type IssuedReportScreenProps = ScreenProps
const IssuedReportScreen = (props: IssuedReportScreenProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canWrite } = usePermissions();
  const { density, onDensityChanged } = useDensity('issuedDensity');
  const [report, setReport] = useState<IssuedReport | undefined>(undefined);
  const { limit, onLimitChanged } = useQueryLimit('issuedQueryLimit');
  const [searchMode, setSearchMode] = useState(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<IssuedReport>(
    query(collection(firestore, issuedCollection), orderBy(fundCluster, "asc")), {
      limit: limit
    }
  );

  const onRemoveInvoke = (report: IssuedReport) => setReport(report);
  const onRemoveDismiss = () => setReport(undefined);
  const onReportRemove = () => {
    if (report) {
      IssuedReportRepository.remove(report)
        .then(() => enqueueSnackbar(t("feedback.issued_report_removed")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.issued_report_remove_error"));
          if (isDev) console.log(error);
        })
        .finally(onRemoveDismiss)
    }
  }

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
          onClick={() => onRemoveInvoke(params.row as IssuedReport)}/>
      ],
    }
  ];
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('issuedColumns', columns);

  const [state, dispatch] = useReducer(reducer, initialState);
  const onIssuedEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
  const onDataGridRowDoubleClicked = (params: GridRowParams) => {
    onIssuedReportSelected(params.row as IssuedReport)
  }

  const onIssuedReportSelected = (report: IssuedReport) => {
    dispatch({
      type: ActionType.UPDATE,
      payload: report,
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
        NoRowsOverlay: IssuedReportDataGridEmptyRows,
        Toolbar: GridToolbar,
        Pagination: PaginationController
      }}
      rows={items}
      columns={columns}
      density={density}
      columnVisibilityModel={visibleColumns}
      loading={isLoading}
      getRowId={(r) => r.issuedReportId}
      onRowDoubleClick={onDataGridRowDoubleClicked}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(newModel) =>
        onVisibilityChange(newModel)
      }/>
  )

  return (
    <Box className={classes.root}>
      <InstantSearch searchClient={Provider} indexName="issued">
        <AdaptiveHeader
          title={t("navigation.issued")}
          actionText={canWrite ? t("button.create_report") : undefined}
          onActionEvent={() => dispatch({ type: ActionType.CREATE })}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {canRead
          ? <>
            <Hidden smDown>
              <Box className={classes.wrapper}>
                {searchMode
                  ? <IssuedReportDataGrid
                    onItemSelect={onDataGridRowDoubleClicked}
                    onRemoveInvoke={onRemoveInvoke}/>
                  : dataGrid
                }
              </Box>
            </Hidden>
            <Hidden smUp>
              {!isLoading
                ? items.length < 1
                  ? <IssuedReportEmptyState/>
                  : <IssuedReportList
                    reports={items}
                    onItemSelect={onIssuedReportSelected}
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
      <IssuedReportEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        report={state.report}
        onDismiss={onIssuedEditorDismiss}/>
      <ConfirmationDialog
        isOpen={report !== undefined}
        title="dialog.issued_report_remove"
        summary="dialog.issued_report_remove_summary"
        onConfirm={onReportRemove}
        onDismiss={onRemoveDismiss}/>
    </Box>
  )
}

const IssuedReportDataGridEmptyRows = () => {
  return (
    <GridEmptyRow>
      <IssuedReportEmptyState/>
    </GridEmptyRow>
  )
}

const IssuedReportEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={UploadFileOutlined}
      title={t("empty.issued_reports_header")}
      subtitle={t("empty.issued_reports_summary")}/>
  )
}

type IssuedReportDataGridCoreProps = HitsProvided<IssuedReport> & {
  onItemSelect: (params: GridRowParams) => void,
  onRemoveInvoke: (report: IssuedReport) => void,
}

const IssuedReportDataGridCore = (props: IssuedReportDataGridCoreProps) => {
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
          onClick={() => props.onRemoveInvoke(params.row as IssuedReport)}/>
      ],
    }
  ];
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('issuedColumns', columns);

  return (
    <DataGrid
      hideFooterPagination
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: IssuedReportDataGridEmptyRows,
        Toolbar: GridToolbar,
      }}
      rows={props.hits}
      columns={columns}
      density={density}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.issuedReportId}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(newModel) =>
        onVisibilityChange(newModel)
      }/>
  )
}
const IssuedReportDataGrid = connectHits<IssuedReportDataGridCoreProps, IssuedReport>(IssuedReportDataGridCore)
export default IssuedReportScreen;