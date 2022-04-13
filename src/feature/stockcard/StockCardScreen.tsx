import makeStyles from "@mui/styles/makeStyles";
import { Box, Fab, Hidden, LinearProgress, Theme } from "@mui/material";
import { getDataGridTheme } from "../core/Core";
import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { AddRounded, DeleteOutlineRounded, DescriptionOutlined, LocalAtmOutlined } from "@mui/icons-material";
import { connectHits, InstantSearch } from "react-instantsearch-dom";
import { StockCard, StockCardRepository } from "./StockCard";
import { DataGrid, GridActionsCellItem, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { ScreenProps } from "../shared/ScreenProps";
import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import GridEmptyRow from "../../components/GridEmptyRows";
import { useSnackbar } from "notistack";
import { usePermissions } from "../auth/AuthProvider";
import React, { useReducer, useRef, useState } from "react";
import { usePagination } from "use-pagination-firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { firestore } from "../../index";
import {
  assetDescription,
  assetStockNumber,
  assetUnitOfMeasure,
  entityName,
  stockCardCollection,
  unitPrice
} from "../../shared/const";
import { ActionType, initialState, reducer } from "./StockCardEditorReducer";
import { DataGridPaginationController } from "../../components/PaginationController";
import { currencyFormatter, isDev } from "../../shared/utils";
import { Provider } from "../../components/Search";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import StockCardList from "./StockCardList";
import { HitsProvided } from "react-instantsearch-core";
import { StockCardEditor } from "./StockCardEditor";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import AdaptiveHeader from "../../components/AdaptiveHeader";
import useDensity from "../shared/useDensity";
import useColumnVisibilityModel from "../shared/useColumnVisibilityModel";
import useQueryLimit from "../shared/useQueryLimit";
import { pdf } from "@react-pdf/renderer";
import StockCardPDF from "./StockCardPDF";
import { ExcelIcon } from "../../components/CustomIcons";
import { convertStockCardToWorkSheet } from "./StockCardSheet";
import * as Excel from "exceljs";
import { convertWorkbookToBlob } from "../shared/Spreadsheet";
import BackgroundWorkDialog from "../shared/BackgroundWorkDialog";

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
  const { density, onDensityChanged } = useDensity('stockCardDensity');
  const [stockCard, setStockCard] = useState<StockCard | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [hasBackgroundWork, setBackgroundWork] = useState(false);
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

  const columns = [
    { field: entityName, headerName: t("field.entity_name"), flex: 1 },
    { field: assetStockNumber, headerName: t("field.stock_number"), flex: 1 },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 2 },
    {
      field: unitPrice,
      headerName: t("field.unit_price"),
      flex: 0.5,
      valueGetter: (params: GridValueGetterParams) => currencyFormatter.format(params.value)
    },
    { field: assetUnitOfMeasure, headerName: t("field.unit_of_measure"), flex: 0.5 },
    {
      field: "actions",
      type: "actions",
      flex: 0.5,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<DeleteOutlineRounded/>}
          label={t("button.delete")}
          onClick={() => onRemoveInvoke(params.row as StockCard)}/>,
        <GridActionsCellItem
          showInMenu
          icon={<DescriptionOutlined/>}
          label={t("button.generate_report")}
          onClick={() => onGenerateReport(params.row as StockCard)}/>,
        <GridActionsCellItem
          showInMenu
          icon={<ExcelIcon/>}
          label={t("button.export_spreadsheet")}
          onClick={() => onExportToSpreadsheet(params.row as StockCard)}/>
      ],
    }
  ]
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('stockCardColumns', columns);
  const onGenerateReport = async (stockCard: StockCard) => {
    setBackgroundWork(true);
    stockCard.entries = await StockCardRepository.fetch(stockCard.stockCardId);
    const blob = await pdf((<StockCardPDF stockCard={stockCard}/>)).toBlob();

    if (linkRef && linkRef.current) {
      linkRef.current.href = URL.createObjectURL(blob);
      linkRef.current.download = `${stockCard.description}.pdf`;
      linkRef.current.click();
    }
    setBackgroundWork(false);
  }
  const onExportToSpreadsheet = async (stockCard: StockCard) => {
    setBackgroundWork(true);
    const workBook = new Excel.Workbook();
    convertStockCardToWorkSheet(workBook, stockCard);

    const blob = await convertWorkbookToBlob(workBook)
    if (linkRef && linkRef.current) {
      linkRef.current.href = URL.createObjectURL(blob);
      linkRef.current.download = `${t("document.stock_card")}.xlsx`;
      linkRef.current.click();
    }
    setBackgroundWork(false);
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

  const dataGrid = (
    <DataGrid
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: StockCardDataGridEmptyRows,
        Toolbar: GridToolbar,
        Pagination: isEnd && items.length > 0 && items.length === limit ? DataGridPaginationController : null,
      }}
      componentsProps={{
        pagination: {
          size: limit,
          canBack: isStart,
          canForward: isEnd,
          onBackward: getPrev,
          onForward: getNext,
          onPageSizeChanged: onLimitChanged
        }
      }}
      rows={items}
      columns={columns}
      density={density}
      columnVisibilityModel={visibleColumns}
      loading={isLoading}
      getRowId={(r) => r.stockCardId}
      onRowDoubleClick={onDataGridRowDoubleClicked}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(m) => onVisibilityChange(m)}/>
  )

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
            <Hidden smDown>
              <Box className={classes.wrapper}>
                {searchMode
                  ? <StockCardDataGrid
                      onItemSelect={onDataGridRowDoubleClicked}
                      onGenerateReport={onGenerateReport}
                      onExportSpreadsheet={onExportToSpreadsheet}
                      onRemoveInvoke={onRemoveInvoke}/>
                  : dataGrid
                }
              </Box>
            </Hidden>
            <Hidden smUp>
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
            </Hidden>
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
      <BackgroundWorkDialog
        isOpen={hasBackgroundWork}
        title={t("dialog.generating_spreadsheet")}
        summary={t("dialog.generating_spreadsheet_summary")}/>
      <Box sx={{ display: 'none' }}>
        <a ref={linkRef} href="https://captive.apple.com">{t("button.download")}</a>
      </Box>
    </Box>
  )
}

type StockCardDataGridProps = HitsProvided<StockCard> & {
  onItemSelect: (params: GridRowParams) => void,
  onGenerateReport: (stockCard: StockCard) => void,
  onExportSpreadsheet: (stockCard: StockCard) => void,
  onRemoveInvoke: (stockCard: StockCard) => void,
}
const StockCardDataGridCore = (props: StockCardDataGridProps) => {
  const { t } = useTranslation();
  const { density, onDensityChanged } = useDensity('stockCardDensity');

  const columns = [
    { field: entityName, headerName: t("field.entity_name"), flex: 1 },
    { field: assetStockNumber, headerName: t("field.stock_number"), flex: 1 },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 1 },
    {
      field: unitPrice,
      headerName: t("field.unit_price"),
      flex: 0.5,
      valueGetter: (params: GridValueGetterParams) => currencyFormatter.format(params.value)
    },
    { field: assetUnitOfMeasure, headerName: t("field.unit_of_measure"), flex: 1 },
    {
      field: "actions",
      type: "actions",
      flex: 0.5,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<DeleteOutlineRounded/>}
          label={t("button.delete")}
          onClick={() => props.onRemoveInvoke(params.row as StockCard)}/>,
        <GridActionsCellItem
          showInMenu
          icon={<DescriptionOutlined/>}
          label={t("button.generate_report")}
          onClick={() => props.onGenerateReport(params.row as StockCard)}/>,
        <GridActionsCellItem
          showInMenu
          icon={<ExcelIcon/>}
          label={t("button.export_spreadsheet")}
          onClick={() => props.onExportSpreadsheet(params.row as StockCard)}/>
      ],
    }
  ];
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('stockCardColumns', columns);

  return (
    <DataGrid
      hideFooterPagination
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: StockCardEmptyState,
        Toolbar: GridToolbar
      }}
      columns={columns}
      rows={props.hits}
      density={density}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.stockCardId}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(newModel) =>
        onVisibilityChange(newModel)
      }/>
  )
}
const StockCardDataGrid = connectHits<StockCardDataGridProps, StockCard>(StockCardDataGridCore);

const StockCardEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={LocalAtmOutlined}
      title={t("empty.stock_card_header")}
      subtitle={t("empty.stock_card_summary")}/>
  )
}

const StockCardDataGridEmptyRows = () => {
  return (
    <GridEmptyRow>
      <StockCardEmptyState/>
    </GridEmptyRow>
  )
}

export default StockCardScreen;