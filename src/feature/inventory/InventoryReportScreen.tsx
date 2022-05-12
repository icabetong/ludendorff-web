import { useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InstantSearch } from "react-instantsearch-core";
import { Box, Fab, LinearProgress } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { AddRounded } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { collection, orderBy, query } from "firebase/firestore";
import { OrderByDirection } from "@firebase/firestore-types";
import { usePagination } from "use-pagination-firestore";
import * as Excel from "exceljs";
import { InventoryReport, InventoryReportRepository } from "./InventoryReport";
import { initialState, reducer, } from "./InventoryReportEditorReducer";
import InventoryReportDataGrid from "./InventoryReportDataGrid";
import { InventoryReportEmptyState } from "./InventoryReportEmptyState";
import InventoryReportList from "./InventoryReportList";
import InventoryReportEditor from "./InventoryReportEditor";
import { convertInventoryReportToSpreadsheet} from "./InventoryReportSheet";
import { usePermissions } from "../auth/AuthProvider";
import { getDataGridTheme } from "../core/Core";
import Client from "../search/Client";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { ExportSpreadsheetDialog, ExportParameters } from "../shared/ExportSpreadsheetDialog";
import { ScreenProps } from "../shared/types/ScreenProps";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import { convertWorkbookToBlob, spreadsheetFileExtension } from "../../shared/spreadsheet";
import { AdaptiveHeader, useDialog } from "../../components";
import {
  fundCluster,
  inventoryCollection,
} from "../../shared/const";
import { isDev } from "../../shared/utils";
import useSort from "../shared/hooks/useSort";
import { firestore } from "../../index";

type InventoryReportScreenProps = ScreenProps
const InventoryReportScreen = (props: InventoryReportScreenProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const show = useDialog();
  const { canRead, canWrite } = usePermissions();
  const { limit, onLimitChanged } = useQueryLimit('inventoryQueryLimit');
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

  const onInventoryReportRemove = async (report: InventoryReport) => {
    try {
      let result = await show({
        title: t("dialog.inventory_remove"),
        description: t("dialog.inventory_remove_summary"),
        confirmButtonText: t("button.delete"),
        dismissButtonText: t("button.cancel")
      });
      if (result) {
        await InventoryReportRepository.remove(report);
        enqueueSnackbar(t("feedback.inventory_removed"));
      }
    } catch (error) {
      enqueueSnackbar(t("feedback.inventory_remove_error"));
      if (isDev) console.log(error);
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
  const onInventoryEditorDismiss = () => dispatch({ type: "dismiss" })
  const onDataGridRowDoubleClicked = (params: GridRowParams) => {
    onInventoryReportSelected(params.row as InventoryReport)
  }

  const onInventoryReportSelected = (report: InventoryReport) => {
    dispatch({
      type: "update",
      payload: report
    })
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InstantSearch
        searchClient={Client}
        indexName="inventories">
        <AdaptiveHeader
          title={t("navigation.inventories")}
          actionText={canWrite ? t("button.create_report") : undefined}
          onActionEvent={() => dispatch({ type: "create" })}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {canRead
          ? <>
            <Box sx={(theme) => ({ flex: 1, padding: 3, display: { xs: 'none', sm: 'block' }, ...getDataGridTheme(theme)})}>
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
                onRemoveInvoke={onInventoryReportRemove}
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
                      onItemRemove={onInventoryReportRemove}/>
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
      <InventoryReportEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        report={state.report}
        onDismiss={onInventoryEditorDismiss}/>
      <ExportSpreadsheetDialog
        key="inventoryExport"
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