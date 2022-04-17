import { Box, Fab, LinearProgress, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useReducer, useRef, useState } from "react";
import { getDataGridTheme } from "../core/Core";
import { InstantSearch } from "react-instantsearch-dom";
import { Provider } from "../../components/Search";
import { useTranslation } from "react-i18next";
import { AddRounded } from "@mui/icons-material";
import { ActionType, initialState, reducer, } from "./InventoryReportEditorReducer";
import { GridRowParams } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { usePermissions } from "../auth/AuthProvider";
import { InventoryReport, InventoryReportRepository } from "./InventoryReport";
import { usePagination } from "use-pagination-firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { firestore } from "../../index";
import InventoryReportList from "./InventoryReportList";
import InventoryReportEditor from "./InventoryReportEditor";
import {
  fundCluster,
  inventoryCollection,
} from "../../shared/const";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import { isDev } from "../../shared/utils";
import { ScreenProps } from "../shared/types/ScreenProps";
import AdaptiveHeader from "../../components/AdaptiveHeader";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import * as Excel from "exceljs";
import { convertInventoryReportToSpreadsheet} from "./InventoryReportSheet";
import { convertWorkbookToBlob, spreadsheetFileExtension } from "../../shared/spreadsheet";
import { ExportSpreadsheetDialog, ExportParameters } from "../shared/ExportSpreadsheetDialog";
import InventoryReportDataGrid from "./InventoryReportDataGrid";
import { InventoryReportEmptyState } from "./InventoryReportEmptyState";
import { OrderByDirection } from "@firebase/firestore-types";
import useSort from "../shared/hooks/useSort";

const useStyles = makeStyles((theme: Theme) => ({
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
  const { limit, onLimitChanged } = useQueryLimit('inventoryQueryLimit');
  const [report, setReport] = useState<InventoryReport | undefined>(undefined);
  const [toExport, setToExport] = useState<InventoryReport | undefined>(undefined);
  const [searchMode, setSearchMode] = useState(false);
  const [hasBackgroundWork, setBackgroundWork] = useState(false);
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const { sortMethod, onSortMethodChange } = useSort('inventorySort');

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

    return query(collection(firestore, inventoryCollection), orderBy(field, direction));
  }

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<InventoryReport>(
    onParseQuery(), {
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

  const onExportSpreadsheet = (inventoryReport: InventoryReport) => {
    setToExport(inventoryReport);
  }
  const onExportDismiss = () => setToExport(undefined);
  const onExport = async (params: ExportParameters) => {
    if (toExport) {
      setBackgroundWork(true);
      toExport.items = await InventoryReportRepository.fetch(toExport.inventoryReportId);
      const workBook = new Excel.Workbook();
      convertInventoryReportToSpreadsheet(workBook, params.worksheetName, toExport);

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

  return (
    <Box sx={{ width: '100%' }}>
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
            <Box className={classes.wrapper} sx={{ display: { xs: 'none', sm: 'block' }}}>
              <InventoryReportDataGrid
                items={items}
                size={limit}
                isLoading={isLoading}
                isSearching={searchMode}
                canBack={isStart}
                canForward={isEnd}
                sortMethod={sortMethod}
                onBackward={getPrev}
                onForward={getNext}
                onItemSelect={onDataGridRowDoubleClicked}
                onExportSpreadsheet={onExportSpreadsheet}
                onRemoveInvoke={onRemoveInvoke}
                onPageSizeChanged={onLimitChanged}
                onSortMethodChanged={onSortMethodChange}/>
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' }}}>
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
            </Box>
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
      <ExportSpreadsheetDialog
        isOpen={Boolean(toExport)}
        isWorking={hasBackgroundWork}
        fileName={toExport?.fundCluster}
        worksheetName={toExport?.fundCluster}
        fileNameOptions={ toExport &&
          [...(toExport!.fundCluster ? [toExport!.fundCluster] : []),
            ...(toExport!.entityName ? [toExport!.entityName] : []),
            ...(toExport!.yearMonth ? [toExport!.yearMonth] : [])
          ]
        }
        worksheetOptions={ toExport &&
          [...(toExport!.fundCluster ? [toExport!.fundCluster] : []),
            ...(toExport!.entityName ? [toExport!.entityName] : []),
            ...(toExport!.yearMonth ? [toExport!.yearMonth] : [])
          ]
        }
        onDismiss={onExportDismiss}
        onSubmit={onExport}/>
      <Box sx={{ display: 'none' }}>
        <a ref={linkRef} href="https://captive.apple.com">{t("button.download")}</a>
      </Box>
    </Box>
  )
}

export default InventoryReportScreen;