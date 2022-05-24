import React, { useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InstantSearch } from "react-instantsearch-core";
import { Box, Fab, LinearProgress, Snackbar, Alert } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { AddRounded } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { collection, orderBy, query, limit } from "firebase/firestore";
import * as Excel from "exceljs";
import { StockCard, StockCardRepository } from "./StockCard";
import StockCardDataGrid from "./StockCardDataGrid";
import { StockCardEditor } from "./StockCardEditor";
import { initialState, reducer } from "./StockCardEditorReducer";
import { StockCardEmptyState } from "./StockCardEmptyState";
import StockCardList from "./StockCardList";
import { convertStockCardToWorkSheet } from "./StockCardSheet";
import { getDataGridTheme } from "../core/Core";
import Client from "../search/Client";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { useDialog } from "../../components/dialog/DialogProvider";
import { AdaptiveHeader } from "../../components/AdaptiveHeader";
import { ExportParameters, ExportSpreadsheetDialog } from "../shared/ExportSpreadsheetDialog";
import usePagination from "../shared/hooks/usePagination";
import useSort from "../shared/hooks/useSort";
import { ScreenProps } from "../shared/types/ScreenProps";
import { convertWorkbookToBlob, spreadsheetFileExtension } from "../../shared/spreadsheet";
import {
  stockCardId,
  stockCardCollection
} from "../../shared/const";
import { isDev } from "../../shared/utils";
import { firestore } from "../../index";
import { usePermissions } from "../auth/AuthProvider";

type StockCardScreenProps = ScreenProps
const StockCardScreen = (props: StockCardScreenProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const show = useDialog();
  const { canRead, canWrite } = usePermissions();
  const [searchMode, setSearchMode] = useState(false);
  const [hasBackgroundWork, setBackgroundWork] = useState(false);
  const [toExport, setToExport] = useState<StockCard | undefined>(undefined);
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const { sortMethod, onSortMethodChange } = useSort('issuedSort');

  const { items, isLoading, error, canBack, canForward, onBackward, onForward } = usePagination<StockCard>(
    query(collection(firestore, stockCardCollection), orderBy(stockCardId, "asc"), limit(25)), stockCardId, 25
  )

  const onRemoveInvoke = async (stockCard: StockCard) => {
    try {
      let result = await show({
        title: t("dialog.stock_card_remove"),
        description: t("dialog.stock_card_remove_summary"),
        confirmButtonText: t("button.delete"),
        dismissButtonText: t("button.cancel")
      });
      if (result) {
        await StockCardRepository.remove(stockCard);
        enqueueSnackbar(t("feedback.stock_card_removed"));
      }
    } catch (error) {
      enqueueSnackbar(t("feedback.stock_card_remove_error"));
      if (isDev) console.log(error);
    }
  }

  const onExportSpreadsheet = (stockCard: StockCard) => {
    setToExport(stockCard);
  }
  const onExportDismiss = () => setToExport(undefined);
  const onExport = async (params: ExportParameters) => {
    if (toExport) {
      setBackgroundWork(true);
      const workBook = new Excel.Workbook();

      let entries = await StockCardRepository.fetch(toExport.stockCardId);
      let stockCard = toExport;
      stockCard.entries = entries;
      convertStockCardToWorkSheet(workBook, params.worksheetName, stockCard);

      const blob = await convertWorkbookToBlob(workBook)
      if (linkRef && linkRef.current) {
        linkRef.current.href = URL.createObjectURL(blob);
        linkRef.current.download = `${params.fileName}${spreadsheetFileExtension}`;
        linkRef.current.click();
      }
      setBackgroundWork(false);
    }
    onExportDismiss();
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  const onStockCardEditorDismiss = () => dispatch({ type: "dismiss" })
  const onDataGridRowDoubleClicked = (params: GridRowParams) => {
    onStockCardSelected(params.row as StockCard)
  }

  const onStockCardSelected = (stockCard: StockCard) => {
    dispatch({
      type: "update",
      payload: stockCard,
    })
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InstantSearch searchClient={Client} indexName="cards">
        <AdaptiveHeader
          title={t("navigation.stock_cards")}
          actionText={canWrite ? t("button.create_stock_card") : undefined}
          onActionEvent={() => dispatch({ type: "create" })}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {canRead
          ? <>
            <Box sx={(theme) => ({ flex: 1, padding: 3, display: { xs: 'none', sm: 'block' }, ...getDataGridTheme(theme)})}>
              <StockCardDataGrid
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
                onRemoveInvoke={onRemoveInvoke}
                onSortMethodChanged={onSortMethodChange}/>
            </Box>
            <Box sx={{ display: { sx: 'block', sm: 'none' }}}>
              {!isLoading
                ? items.length < 1
                  ? <StockCardEmptyState/>
                  : <StockCardList
                      stockCards={items}
                      onItemSelect={onStockCardSelected}
                      onItemRemove={onRemoveInvoke}/>
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
      <StockCardEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        stockCard={state.stockCard}
        onDismiss={onStockCardEditorDismiss}/>
      <ExportSpreadsheetDialog
        key="stockCardExport"
        isOpen={Boolean(toExport)}
        isWorking={hasBackgroundWork}
        fileName={toExport?.description}
        worksheetName={toExport?.entityName}
        fileNameOptions={ toExport &&
          [...(toExport!.entityName ? [toExport!.entityName] : []),
            ...(toExport!.description ? [toExport!.description] : []),
            ...(toExport!.stockNumber ? [toExport!.stockNumber] : [])
          ]
        }
        worksheetOptions={ toExport &&
          [...(toExport!.entityName ? [toExport!.entityName] : []),
            ...(toExport!.description ? [toExport!.description] : []),
            ...(toExport!.stockNumber ? [toExport!.stockNumber] : [])
          ]
        }
        onDismiss={onExportDismiss}
        onSubmit={onExport}/>
      <Box sx={{ display: 'none' }}>
        <a ref={linkRef} href="https://captive.apple.com">{t("button.download")}</a>
      </Box>
      <Snackbar open={Boolean(error)}>
        <Alert severity="error">
          {error?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default StockCardScreen;