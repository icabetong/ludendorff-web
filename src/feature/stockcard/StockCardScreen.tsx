import makeStyles from "@mui/styles/makeStyles";
import { Box, Fab, LinearProgress, Theme } from "@mui/material";
import { getDataGridTheme } from "../core/Core";
import { useTranslation } from "react-i18next";
import { AddRounded } from "@mui/icons-material";
import { InstantSearch } from "react-instantsearch-dom";
import { StockCard, StockCardRepository } from "./StockCard";
import { GridRowParams } from "@mui/x-data-grid";
import { ScreenProps } from "../shared/types/ScreenProps";
import { useSnackbar } from "notistack";
import { usePermissions } from "../auth/AuthProvider";
import React, { useReducer, useRef, useState } from "react";
import { usePagination } from "use-pagination-firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { firestore } from "../../index";
import {
  entityName,
  stockCardCollection
} from "../../shared/const";
import { ActionType, initialState, reducer } from "./StockCardEditorReducer";
import { isDev } from "../../shared/utils";
import { Provider } from "../../components/Search";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import StockCardList from "./StockCardList";
import { StockCardEditor } from "./StockCardEditor";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import AdaptiveHeader from "../../components/AdaptiveHeader";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import { convertStockCardToWorkSheet } from "./StockCardSheet";
import * as Excel from "exceljs";
import { convertWorkbookToBlob, spreadsheetFileExtension } from "../../shared/spreadsheet";
import { ExportParameters, ExportSpreadsheetDialog } from "../shared/ExportSpreadsheetDialog";
import StockCardDataGrid from "./StockCardDataGrid";
import { StockCardEmptyState } from "./StockCardEmptyState";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },
  wrapper: {
    height: '90%',
    padding: '1.4em',
    ...getDataGridTheme(theme)
  }
}));

type StockCardScreenProps = ScreenProps
const StockCardScreen = (props: StockCardScreenProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canWrite } = usePermissions();
  const [stockCard, setStockCard] = useState<StockCard | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [hasBackgroundWork, setBackgroundWork] = useState(false);
  const [toExport, setToExport] = useState<StockCard | undefined>(undefined);
  const { limit, onLimitChanged } = useQueryLimit('stockCardQueryLimit');
  const linkRef = useRef<HTMLAnchorElement | null>(null);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<StockCard>(
    query(collection(firestore, stockCardCollection), orderBy(entityName, "asc")), {
      limit: limit
    }
  )

  const onRemoveInvoke = (stockCard: StockCard) => setStockCard(stockCard);
  const onRemoveDismiss = () => setStockCard(null);
  const onStockCardRemove = () => {
    if (stockCard) {
      StockCardRepository.remove(stockCard)
        .then(() => enqueueSnackbar(t("feedback.stock_card_removed")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.stock_card_remove_error"))
          if (isDev) console.log(error)
        })
        .finally(onRemoveDismiss)
    }
  }

  const onExportSpreadsheet = async (stockCard: StockCard) => {
    setToExport(stockCard);
  }
  const onExportDismiss = () => setToExport(undefined);
  const onExport = async (params: ExportParameters) => {
    if (toExport) {
      setBackgroundWork(true);
      const workBook = new Excel.Workbook();
      convertStockCardToWorkSheet(workBook, params.worksheetName, toExport);

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
  const onStockCardEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
  const onDataGridRowDoubleClicked = (params: GridRowParams) => {
    onStockCardSelected(params.row as StockCard)
  }

  const onStockCardSelected = (stockCard: StockCard) => {
    dispatch({
      type: ActionType.UPDATE,
      payload: stockCard,
    })
  }

  return (
    <Box sx={{ width: '100%' }}>
      <InstantSearch searchClient={Provider} indexName="cards">
        <AdaptiveHeader
          title={t("navigation.stock_cards")}
          actionText={canWrite ? t("button.create_stock_card") : undefined}
          onActionEvent={() => dispatch({ type: ActionType.CREATE })}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {canRead
          ? <>
            <Box className={classes.wrapper} sx={{ display: { xs: 'none', sm: 'block' } }}>
              <StockCardDataGrid
                items={items}
                size={limit}
                canBack={isStart}
                canForward={isEnd}
                isLoading={isLoading}
                isSearching={searchMode}
                onBackward={getPrev}
                onForward={getNext}
                onPageSizeChanged={onLimitChanged}
                onItemSelect={onDataGridRowDoubleClicked}
                onExportSpreadsheet={onExportSpreadsheet}
                onRemoveInvoke={onRemoveInvoke}/>
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
                onClick={() => dispatch({ type: ActionType.CREATE })}>
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
      <ConfirmationDialog
        isOpen={stockCard !== null}
        title="dialog.stock_card_remove"
        summary="dialog.stock_card_remove_summary"
        onConfirm={onStockCardRemove}
        onDismiss={onRemoveDismiss}/>
      <ExportSpreadsheetDialog
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
    </Box>
  )
}

export default StockCardScreen;