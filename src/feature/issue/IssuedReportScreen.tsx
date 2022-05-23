import { useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InstantSearch } from "react-instantsearch-dom";
import { Alert, Box, Fab, LinearProgress, Snackbar } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { AddRounded } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { collection, orderBy, query, limit } from "firebase/firestore";
import { OrderByDirection } from "@firebase/firestore-types";
import * as Excel from "exceljs";
import { IssuedReport, IssuedReportRepository } from "./IssuedReport";
import IssuedReportEditor from "./IssuedReportEditor";
import { initialState, reducer } from "./IssuedReportEditorReducer";
import IssuedReportList from "./IssuedReportList";
import IssuedReportDataGrid from "./IssuedReportDataGrid";
import { IssuedReportEmptyState } from "./IssuedReportEmptyState";
import { convertIssuedReportToSpreadsheet } from "./IssuedReportSheet";
import { getDataGridTheme } from "../core/Core";
import { usePermissions } from "../auth/AuthProvider";
import { ExportParameters, ExportSpreadsheetDialog } from "../shared/ExportSpreadsheetDialog";
import Client from "../search/Client";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import usePagination from "../shared/hooks/usePagination";
import useSort from "../shared/hooks/useSort";
import { ScreenProps } from "../shared/types/ScreenProps";
import { AdaptiveHeader, useDialog } from "../../components";
import { convertWorkbookToBlob, spreadsheetFileExtension } from "../../shared/spreadsheet";
import { fundCluster, issuedCollection, issuedReportId } from "../../shared/const";
import { isDev } from "../../shared/utils";
import { firestore } from "../../index";

type IssuedReportScreenProps = ScreenProps
const IssuedReportScreen = (props: IssuedReportScreenProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const show = useDialog();
  const { canRead, canWrite } = usePermissions();
  const [toExport, setToExport] = useState<IssuedReport | undefined>(undefined);
  const [searchMode, setSearchMode] = useState(false);
  const [hasBackgroundWork, setBackgroundWork] = useState(false);
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const { sortMethod, onSortMethodChange } = useSort('issuedSort');

  const onParseQuery = () => {
    let field = fundCluster;
    let direction: OrderByDirection = "asc";
    if (sortMethod.length > 0) {
      field = sortMethod[0].field;
      switch(sortMethod[0].sort) {
        case "asc":
        case "desc":
          direction = sortMethod[0].sort;
          break;
      }
    }

    return query(collection(firestore, issuedCollection), orderBy(field, direction));
  }

  const { items, isLoading, error, canBack, canForward, onBackward, onForward } = usePagination<IssuedReport>(
    query(collection(firestore, issuedCollection), orderBy(issuedReportId, 'asc'), limit(25)),
    issuedReportId, 25
  );

  const onIssuedReportRemove = async (report: IssuedReport) => {
    try {
      let result = await show({
        title: t("dialog.issued_report_remove"),
        description: t("dialog.issued_report_remove_summary"),
        confirmButtonText: t("button.delete"),
        dismissButtonText: t("button.cancel")
      });
      if (result) {
        await IssuedReportRepository.remove(report);
        enqueueSnackbar(t("feedback.issued_report_removed"));
      }
    } catch (error) {
      enqueueSnackbar(t("feedback.issued_report_remove_error"));
      if (isDev) console.log(error);
    }
  }

  const onExportSpreadsheet = async (issuedReport: IssuedReport) => {
    setToExport(issuedReport);
  }
  const onExportDismiss = () => setToExport(undefined);
  const onExport = async (params: ExportParameters) => {
    if (toExport) {
      setBackgroundWork(true);
      toExport.items = await IssuedReportRepository.fetch(toExport.issuedReportId);
      const workBook = new Excel.Workbook();
      convertIssuedReportToSpreadsheet(workBook, params.worksheetName, toExport);

      const blob = await convertWorkbookToBlob(workBook);
      if (linkRef && linkRef.current) {
        linkRef.current.href = URL.createObjectURL(blob);
        linkRef.current.download = `${params.fileName}${spreadsheetFileExtension}`;
        linkRef.current?.click();
      }
      setBackgroundWork(false);
    }
    onExportDismiss();
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  const onIssuedEditorDismiss = () => dispatch({ type: "dismiss" })
  const onDataGridRowDoubleClicked = (params: GridRowParams) => {
    onIssuedReportSelected(params.row as IssuedReport)
  }

  const onIssuedReportSelected = (report: IssuedReport) => {
    dispatch({
      type: "update",
      payload: report,
    })
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InstantSearch searchClient={Client} indexName="issued">
        <AdaptiveHeader
          title={t("navigation.issued")}
          actionText={canWrite ? t("button.create_report") : undefined}
          onActionEvent={() => dispatch({ type: "create" })}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {canRead
          ? <>
            <Box sx={(theme) => ({ flex: 1, padding: 3, display: { xs: 'none', sm: 'block' }, ...getDataGridTheme(theme)})}>
              <IssuedReportDataGrid
                items={items}
                canBack={canBack}
                canForward={canForward}
                isLoading={isLoading}
                isSearching={searchMode}
                sortMethod={sortMethod}
                onBackward={onBackward}
                onForward={onForward}
                onItemSelect={onDataGridRowDoubleClicked}
                onExportSpreadsheet={onExportSpreadsheet}
                onRemoveInvoke={onIssuedReportRemove}
                onSortMethodChanged={onSortMethodChange}/>
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' }}}>
              {!isLoading
                ? items.length < 1
                  ? <IssuedReportEmptyState/>
                  : <IssuedReportList
                      reports={items}
                      onItemSelect={onIssuedReportSelected}
                      onItemRemove={onIssuedReportRemove}/>
                : <LinearProgress/>
              }
              <Fab
                color="primary"
                aria-label={t("button.add")}
                onClick={() => dispatch({ type: "create" })}>
                <AddRounded/>
              </Fab>
            </Box>
          </>
          : <ErrorNoPermissionState/>
        }
      </InstantSearch>
      <IssuedReportEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        report={state.report}
        onDismiss={onIssuedEditorDismiss}/>
      <ExportSpreadsheetDialog
        key="issuedExport"
        isOpen={Boolean(toExport)}
        isWorking={hasBackgroundWork}
        fileName={toExport?.serialNumber}
        worksheetName={toExport?.fundCluster}
        fileNameOptions={toExport &&
          [...(toExport!.fundCluster ? [toExport!.fundCluster] : []),
            ...(toExport!.entityName ? [toExport!.entityName] : []),
            ...(toExport!.serialNumber ? [toExport!.serialNumber] : [])
          ]
        }
        worksheetOptions={toExport &&
          [...(toExport!.fundCluster ? [toExport!.fundCluster] : []),
            ...(toExport!.entityName ? [toExport!.entityName] : []),
            ...(toExport!.serialNumber ? [toExport!.serialNumber] : [])
          ]
        }
        onDismiss={onExportDismiss}
        onSubmit={onExport}/>
      <Box sx={{display: 'none'}}>
        <a ref={linkRef} href="https://capstive.apple.com">{t("button.download")}</a>
      </Box>
      <Snackbar open={Boolean(error)}>
        <Alert severity="error">
          {error?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default IssuedReportScreen;