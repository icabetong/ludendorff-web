import { Box, Fab, LinearProgress, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { getDataGridTheme } from "../core/Core";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { usePermissions } from "../auth/AuthProvider";
import { useReducer, useRef, useState } from "react";
import { IssuedReport, IssuedReportRepository } from "./IssuedReport";
import { usePagination } from "use-pagination-firestore";
import { fundCluster, issuedCollection } from "../../shared/const";
import { collection, orderBy, query } from "firebase/firestore";
import { firestore } from "../../index";
import { isDev } from "../../shared/utils";
import { GridRowParams } from "@mui/x-data-grid";
import { AddRounded } from "@mui/icons-material";
import { ActionType, initialState, reducer } from "./IssuedReportEditorReducer";
import { InstantSearch } from "react-instantsearch-dom";
import { Provider } from "../../components/Search";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import IssuedReportList from "./IssuedReportList";
import IssuedReportEditor from "./IssuedReportEditor";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import { ScreenProps } from "../shared/types/ScreenProps";
import AdaptiveHeader from "../../components/AdaptiveHeader";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import * as Excel from "exceljs";
import { convertIssuedReportToSpreadsheet } from "./IssuedReportSheet";
import { convertWorkbookToBlob, spreadsheetFileExtension } from "../../shared/spreadsheet";
import { ExportParameters, ExportSpreadsheetDialog } from "../shared/ExportSpreadsheetDialog";
import IssuedReportDataGrid from "./IssuedReportDataGrid";
import { IssuedReportEmptyState } from "./IssuedReportEmptyState";
import useSort from "../shared/hooks/useSort";
import { OrderByDirection } from "@firebase/firestore-types";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
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
  const [report, setReport] = useState<IssuedReport | undefined>(undefined);
  const { limit, onLimitChanged } = useQueryLimit('issuedQueryLimit');
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

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<IssuedReport>(
    onParseQuery(), { limit: limit }
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

  return (
    <Box sx={{ width: '100%' }}>
      <InstantSearch searchClient={Provider} indexName="issued">
        <AdaptiveHeader
          title={t("navigation.issued")}
          actionText={canWrite ? t("button.create_report") : undefined}
          onActionEvent={() => dispatch({ type: ActionType.CREATE })}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {canRead
          ? <>
            <Box className={classes.wrapper} sx={{ display: { xs: 'none', sm: 'block' }}}>
              <IssuedReportDataGrid
                items={items}
                size={limit}
                canBack={isStart}
                canForward={isEnd}
                isLoading={isLoading}
                isSearching={searchMode}
                sortMethod={sortMethod}
                onBackward={getPrev}
                onForward={getNext}
                onPageSizeChanged={onLimitChanged}
                onItemSelect={onDataGridRowDoubleClicked}
                onExportSpreadsheet={onExportSpreadsheet}
                onRemoveInvoke={onRemoveInvoke}
                onSortMethodChanged={onSortMethodChange}/>
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' }}}>
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
      <ConfirmationDialog
        isOpen={report !== undefined}
        title="dialog.issued_report_remove"
        summary="dialog.issued_report_remove_summary"
        onConfirm={onReportRemove}
        onDismiss={onRemoveDismiss}/>
      <ExportSpreadsheetDialog
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
    </Box>
  )
}

export default IssuedReportScreen;