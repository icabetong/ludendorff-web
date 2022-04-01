import { Box, Hidden, IconButton, LinearProgress, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { getDataGridTheme } from "../core/Core";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { usePermissions } from "../auth/AuthProvider";
import { useReducer, useState } from "react";
import { IssuedReport, IssuedReportRepository } from "./IssuedReport";
import { usePagination } from "use-pagination-firestore";
import { fundCluster, issuedCollection, entityName, serialNumber, date } from "../../shared/const";
import { query, collection, orderBy } from "firebase/firestore";
import { firestore } from "../../index";
import { formatDate, isDev } from "../../shared/utils";
import { DataGrid, GridCellParams, GridOverlay, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { AddRounded, DeleteOutlineRounded, UploadFileOutlined } from "@mui/icons-material";
import {
  ActionType,
  initialState,
  reducer
} from "./IssuedReportEditorReducer";
import { DataGridPaginationController } from "../../components/PaginationController";
import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import { connectHits, InstantSearch } from "react-instantsearch-dom";
import { Provider } from "../../components/Search";
import PageHeader from "../../components/PageHeader";
import ComponentHeader from "../../components/ComponentHeader";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import EmptyStateComponent from "../state/EmptyStates";
import { HitsProvided } from "react-instantsearch-core";
import { usePreferences } from "../settings/Preference";
import IssuedReportList from "./IssuedReportList";
import IssuedReportEditor from "./IssuedReportEditor";
import ConfirmationDialog from "../shared/ConfirmationDialog";

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

type IssuedReportScreenProps = {
  onDrawerToggle: () => void,
}
const IssuedReportScreen = (props: IssuedReportScreenProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canWrite } = usePermissions();
  const [report, setReport] = useState<IssuedReport | undefined>(undefined);
  const [size, setSize] = useState(15);
  const [searchMode, setSearchMode] = useState(false);
  const userPreference = usePreferences();

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<IssuedReport>(
    query(collection(firestore, issuedCollection), orderBy(fundCluster, "asc")), {
      limit: 15
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
      headerName: t("field.accountability_date"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        const formatted = formatDate(params.row.accountabilityDate);
        return t(formatted)
      }
    },
    {
      field: "delete",
      headerName: t("button.delete"),
      flex: 0.5,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const report = params.row as IssuedReport;
        return (
          <IconButton
            aria-label={ t("button.delete") }
            onClick={ () => onRemoveInvoke(report) }
            size="large">
            <DeleteOutlineRounded/>
          </IconButton>
        )
      }
    }
  ]

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

  const pagination = () => {
    return (
      <DataGridPaginationController
        canBack={isStart}
        canForward={isEnd}
        onBackward={getPrev}
        onForward={getNext}
        size={size}
        onPageSizeChanged={setSize}/>
    )
  }

  const dataGrid = (
    <DataGrid
      components={ {
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: EmptyStateOverlay,
        Toolbar: GridToolbar,
        Pagination: pagination
      } }
      rows={ items }
      columns={ columns }
      density={ userPreference.density }
      loading={ isLoading }
      getRowId={ (r) => r.inventoryReportId }
      onRowDoubleClick={ onDataGridRowDoubleClicked }/>
  )

  return (
    <Box className={classes.root}>
      <InstantSearch searchClient={Provider} indexName="issued">
        <Hidden lgDown>
          <PageHeader
            title={t("navigation.issued")}
            buttonText={canWrite ? t("button.create_report") : undefined}
            buttonIcon={AddRounded}
            buttonOnClick={() => dispatch({type: ActionType.CREATE})}
            onSearchFocusChanged={setSearchMode}/>
        </Hidden>
        <Hidden lgUp>
          <ComponentHeader
            title={t("navigation.issued")}
            onDrawerToggle={props.onDrawerToggle}
            buttonText={
              canWrite ? t("button.create_report") : undefined
            }
            buttonIcon={AddRounded}
            buttonOnClick={() => dispatch({ type: ActionType.CREATE })}/>
        </Hidden>
        { canRead
           ? <>
              <Hidden smDown>
                <Box className={classes.wrapper}>
                  { searchMode
                    ? <IssuedReportDataGrid
                        onItemSelect={onDataGridRowDoubleClicked}
                        onRemoveInvoke={onRemoveInvoke}/>
                    : dataGrid
                  }
                </Box>
              </Hidden>
              <Hidden smUp>
                { !isLoading
                    ? items.length < 1
                      ? <IssuedReportEmptyState/>
                      : <IssuedReportList
                          reports={items}
                          onItemSelect={onIssuedReportSelected}
                          onItemRemove={onRemoveInvoke}/>
                    : <LinearProgress/>
                }
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

const EmptyStateOverlay = () => {
  return (
    <GridOverlay>
      <IssuedReportEmptyState/>
    </GridOverlay>
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
  const userPreference = usePreferences();

  const columns = [
    { field: fundCluster, headerName: t("field.fund_cluster"), flex: 1 },
    { field: entityName, headerName: t("field.entity_name"), flex: 1 },
    { field: serialNumber, headerName: t("field.serial_number"), flex: 1 },
    {
      field: date,
      headerName: t("field.accountability_date"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        const formatted = formatDate(params.row.accountabilityDate);
        return t(formatted)
      }
    },
    {
      field: "delete",
      headerName: t("button.delete"),
      flex: 0.5,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const report = params.row as IssuedReport;
        return (
          <IconButton
            aria-label={ t("button.delete") }
            onClick={ () => props.onRemoveInvoke(report) }
            size="large">
            <DeleteOutlineRounded/>
          </IconButton>
        )
      }
    }
  ]

  return (
    <DataGrid
      hideFooterPagination
      components={ {
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: EmptyStateOverlay,
        Toolbar: GridToolbar,
      } }
      rows={ props.hits }
      columns={ columns }
      density={ userPreference.density }
      getRowId={ (r) => r.issuedReportId }
      onRowDoubleClick={ props.onItemSelect }/>
  )
}
const IssuedReportDataGrid = connectHits<IssuedReportDataGridCoreProps, IssuedReport>(IssuedReportDataGridCore)
export default IssuedReportScreen;